import browser from 'webextension-polyfill';
import { getDomain } from 'tldts';
import type { NetworkRule } from '@adguard/tsurlfilter';

import { defaultFilteringLog, FilteringEventType } from '../../../common/filtering-log';
import { logger } from '../../../common/utils/logger';
import { isChromium, isFirefox } from '../utils/browser-detector';
import { tabsApi } from '../api';
import type { ConfigurationMV2 } from '../configuration';
import type { WebRequestBlockingResponse } from '../request/request-blocking-api';

/**
 * This service encapsulate processing of $document modifier rules.
 *
 * Service is initialized in {@link configure} method, called from {@link EngineApi#startEngine}.
 *
 * Request rule is processed in {@link getDocumentBlockingResponse} method, called
 * from {@link RequestBlockingApi.getBlockingResponse}.
 *
 * Request rule is processed following scenario:
 * - if domain is trusted, ignore request
 * - if rule is document blocking and {@link documentBlockingPageUrl} is undefined, return
 * {@link WebRequestApi.onBeforeRequest} blocking response
 * - if rule is document blocking and {@link documentBlockingPageUrl} is defined, return redirect response with
 * required params.
 * - if browser is Firefox, update page url by {@link browser.tabs} API, because FF doesn't support redirects to
 * extension pages.
 */
export class DocumentBlockingService {
    // base url of document blocking page
    private documentBlockingPageUrl: string | undefined;

    // list of domain names of sites, which should be excluded from document blocking
    private trustedDomains: string[] = [];

    /**
     * Configures service instance {@link documentBlockingPageUrl}.
     *
     * @param configuration App {@link Configuration}.
     */
    public configure(configuration: ConfigurationMV2): void {
        const { settings, trustedDomains } = configuration;

        this.documentBlockingPageUrl = settings?.documentBlockingPageUrl;
        this.trustedDomains = trustedDomains;
    }

    /**
     * Processes $document modifier rule matched request in {@link RequestBlockingApi.getBlockingResponse}.
     *
     * @param requestId Request id.
     * @param requestUrl Url of processed request.
     * @param rule {@link NetworkRule} Instance of matched rule.
     * @param tabId TabId of processed request.
     * @returns Blocking response or null {@link WebRequestApi.onBeforeRequest}.
     */
    public getDocumentBlockingResponse(
        requestId: string,
        requestUrl: string,
        rule: NetworkRule,
        tabId: number,
    ): WebRequestBlockingResponse {
        // if request url domain is trusted, ignore document blocking rule
        if (this.isTrustedDomain(requestUrl)) {
            return undefined;
        }

        // public filtering log event
        defaultFilteringLog.publishEvent({
            type: FilteringEventType.ApplyBasicRule,
            data: {
                eventId: requestId,
                tabId,
                rule,
            },
        });

        // if documentBlockingPage is undefined, block request
        if (!this.documentBlockingPageUrl) {
            return { cancel: true };
        }

        // get document blocking url with required params
        const blockingUrl = DocumentBlockingService.createBlockingUrl(
            this.documentBlockingPageUrl,
            requestUrl,
            rule.getText(),
        );

        // Firefox doesn't allow redirects to extension pages
        // We set blocking page url via browser.tabs api for bypassing this limitation
        if (isFirefox) {
            DocumentBlockingService.reloadTabWithBlockingPage(tabId, blockingUrl);
        // Chrome doesn't allow to show extension pages in incognito mode
        } else if (isChromium && tabsApi.isIncognitoTab(tabId)) {
            // Closing tab before opening a new one may lead to browser crash (Chromium)
            browser.tabs.create({ url: blockingUrl })
                .then(() => {
                    browser.tabs.remove(tabId);
                })
                .catch((e) => {
                    logger.warn(`Can't open info page about blocked domain. Err: ${e}`);
                });
        }

        return { redirectUrl: blockingUrl };
    }

    /**
     * Checks if request url domain is trusted.
     *
     * @param url Request url.
     * @returns True, if request url domain is trusted, else false.
     */
    private isTrustedDomain(url: string): boolean {
        const domain = getDomain(url);

        if (domain) {
            return this.trustedDomains.includes(domain);
        }

        return false;
    }

    /**
     * Updates tab with document blocking page url.
     *
     * @param tabId Tab id.
     * @param url Blocking page url.
     */
    private static reloadTabWithBlockingPage(tabId: number, url: string): void {
        const tabContext = tabsApi.getTabContext(tabId);

        if (!tabContext) {
            return;
        }

        browser.tabs.update(tabId, { url });
    }

    /**
     * Sets required url and rule query params to document-blocking page url.
     *
     * @param  documentBlockingPageUrl Url of document-blocking page.
     * @param  requestUrl Processed request url.
     * @param  ruleText Matched rule text.
     * @returns Document blocking page url with required params.
     */
    private static createBlockingUrl(
        documentBlockingPageUrl: string,
        requestUrl: string,
        ruleText: string,
    ): string {
        const url = new URL(documentBlockingPageUrl);

        url.searchParams.set('url', requestUrl);
        url.searchParams.set('rule', ruleText);

        return url.toString();
    }
}

export const documentBlockingService = new DocumentBlockingService();
