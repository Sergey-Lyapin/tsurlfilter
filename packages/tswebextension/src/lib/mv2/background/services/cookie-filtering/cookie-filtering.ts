/* eslint-disable class-methods-use-this,jsdoc/require-description-complete-sentence */
import { nanoid } from 'nanoid';
import { NetworkRule, CookieModifier } from '@adguard/tsurlfilter';
import { getDomain } from 'tldts';
import {
    ContentType,
    defaultFilteringLog,
    FilteringEventType,
    FilteringLogInterface,
    logger,
} from '../../../../common';
import CookieRulesFinder from './cookie-rules-finder';
import ParsedCookie from './parsed-cookie';
import CookieUtils from './utils';
import BrowserCookieApi from './browser-cookie/browser-cookie-api';
import { findHeaderByName } from '../../utils/headers';
import { RequestContext, requestContextStorage } from '../../request';
import { tabsApi } from '../../api';

/**
 * Cookie filtering.
 *
 * The following public methods should be set as suitable webrequest events listeners, check sample extension in this
 * repo for an example.
 *
 * Logic introduction:
 *  onBeforeSendHeaders:
 *  - get all cookies for request url;
 *  - store cookies (first-party);
 *
 *  onHeadersReceived:
 *  - parse set-cookie header, only to detect if the cookie in header will be set from third-party request;
 *  - save third-party flag for this cookie cookie.thirdParty=request.thirdParty;
 *  - apply rules via removing them from headers and removing them with browser.cookies api;
 *  TODO Rewrite/split method for extensions on MV3, because we wont have possibility to remove rules via headers.
 *
 *  onCompleted
 *  - apply rules via content script
 *  In content-scripts (check /src/content-script/cookie-controller.ts):
 *  - get matching cookie rules
 *  - apply
 */
export class CookieFiltering {
    private filteringLog: FilteringLogInterface;

    private browserCookieApi: BrowserCookieApi = new BrowserCookieApi();

    /**
     * Constructor.
     *
     * @param filteringLog Filtering log.
     */
    constructor(filteringLog: FilteringLogInterface) {
        this.filteringLog = filteringLog;
    }

    /**
     * Parses cookies from headers.
     *
     * @param context Request context.
     *
     * @returns True if headers were modified.
     */
    public onBeforeSendHeaders(context: RequestContext): boolean {
        const { requestHeaders, requestUrl, requestId } = context;
        if (!requestHeaders || !requestUrl) {
            return false;
        }

        const cookieHeader = findHeaderByName(requestHeaders, 'Cookie');

        if (!cookieHeader?.value) {
            return false;
        }

        const cookies = CookieUtils.parseCookies(cookieHeader.value, requestUrl);
        if (cookies.length === 0) {
            return false;
        }

        // Saves cookies to context
        requestContextStorage.update(requestId, { cookies });

        // Removes cookies from browser with browser.cookies api, but not
        // removing them from context to correct process them in headers.
        // IMPORTANT: This method reads cookies from context, so it should be
        // called before method that change headers, since that method will
        // remove or change headers in context.
        this.applyRules(context)
            .catch((e) => {
                logger.error((e as Error).message);
            });

        // Removes cookie from headers and updates context.
        // Note: this method won't work in the extension build with manifest v3.
        const headersModified = this.applyRulesToRequestCookieHeaders(context);

        return headersModified;
    }

    /**
     * Applies cookies to request headers.
     *
     * @param context Request context.
     * @returns True if headers were modified.
     */
    private applyRulesToRequestCookieHeaders(context: RequestContext): boolean {
        let headersModified = false;

        const {
            requestHeaders,
            cookies,
            matchingResult,
            requestUrl,
            thirdParty,
            tabId,
            requestId,
        } = context;

        if (!requestHeaders
            || !matchingResult
            || !requestUrl
            || typeof thirdParty !== 'boolean'
            || !cookies
        ) {
            return headersModified;
        }

        const cookieRules = matchingResult.getCookieRules();

        for (let i = 0; i < cookies.length; i += 1) {
            const cookie = cookies[i];

            if (!cookie) {
                continue;
            }

            const bRule = CookieRulesFinder.lookupNotModifyingRule(cookie.name, cookieRules, thirdParty);

            if (bRule) {
                if (!bRule.isAllowlist()) {
                    // Remove from cookies array.
                    cookies.splice(i, 1);
                    // Move the loop counter back because we removed one element
                    // from the iterated array.
                    i -= 1;
                    headersModified = true;
                }

                this.recordCookieEvent(tabId, cookie, requestUrl, bRule, false, thirdParty);
            }

            const mRules = CookieRulesFinder.lookupModifyingRules(cookie.name, cookieRules, thirdParty);
            if (mRules.length > 0) {
                const appliedRules = CookieFiltering.applyRuleToBrowserCookie(cookie, mRules);
                if (appliedRules.length > 0) {
                    headersModified = true;
                }
                appliedRules.forEach((r) => {
                    this.recordCookieEvent(tabId, cookie, requestUrl, r, true, thirdParty);
                });
            }
        }

        if (headersModified) {
            const cookieHeaderIndex = requestHeaders.findIndex((header) => header.name.toLowerCase() === 'cookie');
            if (cookieHeaderIndex !== -1) {
                if (cookies.length > 0) {
                    // Update "cookie" header before send request to server.
                    requestHeaders[cookieHeaderIndex].value = CookieUtils.serializeCookieToRequestHeader(cookies);
                } else {
                    // Empty cookies, delete header "Cookie".
                    requestHeaders.splice(cookieHeaderIndex, 1);
                }
            }

            // Update headers and cookies in context.
            requestContextStorage.update(requestId, { requestHeaders, cookies });
        }

        return headersModified;
    }

    /**
     * Applies cookies to response headers.
     *
     * @param context Request context.
     * @returns True if headers were modified.
     */
    private applyRulesToResponseCookieHeaders(context: RequestContext): boolean {
        let headersModified = false;

        const {
            responseHeaders,
            matchingResult,
            requestUrl,
            thirdParty,
            tabId,
            requestId,
        } = context;

        if (!responseHeaders
            || !matchingResult
            || !requestUrl
            || typeof thirdParty !== 'boolean'
        ) {
            return headersModified;
        }

        const cookieRules = matchingResult.getCookieRules();

        for (let i = responseHeaders.length - 1; i >= 0; i -= 1) {
            const header = responseHeaders[i];
            const cookie = CookieUtils.parseSetCookieHeader(header, requestUrl);

            if (!cookie) {
                continue;
            }

            const bRule = CookieRulesFinder.lookupNotModifyingRule(cookie.name, cookieRules, thirdParty);

            if (bRule) {
                if (!bRule.isAllowlist()) {
                    responseHeaders.splice(i, 1);
                    headersModified = true;
                }

                this.recordCookieEvent(tabId, cookie, requestUrl, bRule, false, thirdParty);
            }

            const mRules = CookieRulesFinder.lookupModifyingRules(cookie.name, cookieRules, thirdParty);
            if (mRules.length > 0) {
                const appliedRules = CookieFiltering.applyRuleToBrowserCookie(cookie, mRules);
                if (appliedRules.length > 0) {
                    headersModified = true;
                    responseHeaders[i] = {
                        name: 'set-cookie',
                        value: CookieUtils.serializeCookieToResponseHeader(cookie),
                    };
                    appliedRules.forEach((r) => {
                        this.recordCookieEvent(tabId, cookie, requestUrl, r, true, thirdParty);
                    });
                }
            }
        }

        if (headersModified) {
            requestContextStorage.update(requestId, { responseHeaders });
        }

        return headersModified;
    }

    /**
     * Parses set-cookie header and looks up third-party cookies.
     * This callback won't work for mv3 extensions.
     * TODO separate or rewrite to mv2 and mv3 methods.
     *
     * @param context Request context.
     * @returns True if headers were modified.
     */
    public onHeadersReceived(context: RequestContext): boolean {
        const {
            responseHeaders,
            requestUrl,
            thirdParty,
            requestId,
        } = context;

        if (responseHeaders
            && requestUrl
            && typeof thirdParty === 'boolean'
        ) {
            const cookies = CookieUtils.parseSetCookieHeaders(responseHeaders, requestUrl);
            const newCookies = cookies.filter((c) => !context.cookies?.includes(c));
            for (const cookie of newCookies) {
                cookie.thirdParty = thirdParty;
            }

            requestContextStorage.update(requestId, {
                cookies: context.cookies ? [...context.cookies, ...newCookies] : newCookies,
            });
        }

        // Removes cookies from browser with browser.cookies api, but not
        // removing them from context to correct process them in headers.
        // IMPORTANT: This method reads cookies from context, so it should be
        // called before method that change headers, since that method will
        // remove or change headers in context.
        this.applyRules(context)
            .catch((e) => {
                logger.error((e as Error).message);
            });

        // Remove cookie headers.
        // This method won't work in the extension build with manifest v3.
        const headersModified = this.applyRulesToResponseCookieHeaders(context);

        return headersModified;
    }

    /**
     * TODO: Return engine startup status data to content script
     * to delay execution of cookie rules until the engine is ready
     *
     * Looks up blocking rules for content-script in frame context.
     *
     * @param tabId Tab id.
     * @param frameId Frame id.
     * @returns List of blocking rules.
     */
    public getBlockingRules(tabId: number, frameId: number): NetworkRule[] {
        const frame = tabsApi.getTabFrame(tabId, frameId);

        if (!frame || !frame.matchingResult) {
            return [];
        }

        const cookieRules = frame.matchingResult.getCookieRules();

        return CookieRulesFinder.getBlockingRules(frame.url, cookieRules);
    }

    /**
     * Applies rules.
     *
     * @param context Request context.
     */
    private async applyRules(context: RequestContext): Promise<void> {
        const {
            matchingResult, cookies, requestUrl, tabId,
        } = context;

        if (!matchingResult || !cookies) {
            return;
        }

        const cookieRules = matchingResult.getCookieRules();

        const promises = cookies.map(async (cookie) => {
            await this.applyRulesToCookie(cookie, cookieRules, requestUrl, tabId);
        });

        await Promise.all(promises);
    }

    /**
     * Attempts to find a "parent" cookie with a wider "path" field,
     * the scope of which includes the specified cookie from
     * the function parameters.
     *
     * This needs to prevent create of multiple "child"-cookies
     * and only modified expiration of general "parent"-cookie,
     * which covered "children"-cookies by 'path' value.
     *
     * @param cookie Cookie, for which need to find the "parent" cookie.
     *
     * @returns Item of parent cookie {@link ParsedCookie} or null if not found.
     */
    private async findParentCookie(cookie: ParsedCookie): Promise<ParsedCookie | null> {
        const pattern = {
            url: cookie.url,
            name: cookie.name,
            domain: cookie.domain,
            secure: cookie.secure,
        };

        const parentCookies = await this.browserCookieApi.findCookies(pattern);
        const sortedParentCookies = parentCookies.sort((a, b) => a.path.length - b.path.length);

        for (let i = 0; i < sortedParentCookies.length; i += 1) {
            const parentCookie = sortedParentCookies[i];

            if (cookie.path?.startsWith(parentCookie.path)) {
                return ParsedCookie.fromBrowserCookie(parentCookie, cookie.url);
            }
        }

        return null;
    }

    /**
     * Applies rules to cookie.
     *
     * @param cookie Cookie.
     * @param cookieRules Cookie rules.
     * @param requestUrl Request URL, needs to record filtering event.
     * @param tabId Tab id.
     */
    private async applyRulesToCookie(
        cookie: ParsedCookie,
        cookieRules: NetworkRule[],
        requestUrl: string,
        tabId: number,
    ): Promise<void> {
        const cookieName = cookie.name;
        const isThirdPartyCookie = cookie.thirdParty;

        const bRule = CookieRulesFinder.lookupNotModifyingRule(cookieName, cookieRules, isThirdPartyCookie);
        if (bRule) {
            if (bRule.isAllowlist() || await this.browserCookieApi.removeCookie(cookie.name, cookie.url)) {
                this.recordCookieEvent(tabId, cookie, requestUrl, bRule, false, isThirdPartyCookie);
            }

            return;
        }

        const mRules = CookieRulesFinder.lookupModifyingRules(cookieName, cookieRules, isThirdPartyCookie);
        if (mRules.length > 0) {
            // Try to find "parent" cookie and modify it instead of creating
            // "child copy" cookie.
            const parentCookie = await this.findParentCookie(cookie);
            const cookieToModify = parentCookie || cookie;

            const appliedRules = CookieFiltering.applyRuleToBrowserCookie(cookieToModify, mRules);
            if (appliedRules.length > 0) {
                if (await this.browserCookieApi.modifyCookie(cookieToModify)) {
                    appliedRules.forEach((r) => {
                        this.recordCookieEvent(tabId, cookieToModify, requestUrl, r, true, isThirdPartyCookie);
                    });
                }
            }
        }
    }

    /**
     * Modifies instance of {@link ParsedCookie} with provided rules.
     *
     * @param cookie Cookie modify.
     * @param rules Cookie matching rules.
     * @returns Applied rules.
     */
    private static applyRuleToBrowserCookie(cookie: ParsedCookie, rules: NetworkRule[]): NetworkRule[] {
        const appliedRules = [];

        for (let i = 0; i < rules.length; i += 1) {
            const rule = rules[i];

            if (rule.isAllowlist()) {
                appliedRules.push(rule);
                continue;
            }

            const cookieModifier = rule.getAdvancedModifier() as CookieModifier;

            let modified = false;

            const sameSite = cookieModifier.getSameSite();
            if (sameSite && cookie.sameSite !== sameSite) {
                // eslint-disable-next-line no-param-reassign
                cookie.sameSite = sameSite;
                modified = true;
            }

            const maxAge = cookieModifier.getMaxAge();
            if (maxAge) {
                if (CookieUtils.updateCookieMaxAge(cookie, maxAge)) {
                    modified = true;
                }
            }

            if (modified) {
                appliedRules.push(rule);
            }
        }

        return appliedRules;
    }

    /**
     * Records cookie event to filtering log.
     *
     * @param tabId Id of the tab.
     * @param cookie Item of {@link ParsedCookie}.
     * @param requestUrl URL of the request.
     * @param rule Applied modifying or deleting rule.
     * @param isModifyingCookieRule Is applied rule modifying or not.
     * @param requestThirdParty Whether request third party or not.
     */
    private recordCookieEvent(
        tabId: number,
        cookie: ParsedCookie,
        requestUrl: string,
        rule: NetworkRule,
        isModifyingCookieRule: boolean,
        requestThirdParty: boolean,
    ): void {
        this.filteringLog.publishEvent({
            type: FilteringEventType.Cookie,
            data: {
                eventId: nanoid(),
                tabId,
                cookieName: cookie.name,
                cookieValue: cookie.value,
                frameDomain: getDomain(requestUrl) || requestUrl,
                rule,
                isModifyingCookieRule,
                requestThirdParty,
                timestamp: Date.now(),
                requestType: ContentType.Cookie,
            },
        });
    }
}

export const cookieFiltering = new CookieFiltering(defaultFilteringLog);
