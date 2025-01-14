/* eslint-disable jsdoc/require-description-complete-sentence */
/**
 * @file Describes types from declarativeNetRequest,
 * since @types/chrome does not contain actual information.
 *
 * Updated 07/09/2022.
 */

import { z as zod } from 'zod';

/**
 * https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-DomainType
 */
export enum DomainType {
    FirstParty = 'firstParty',
    ThirdParty = 'thirdParty',
}

/**
 * https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-ResourceType
 */
export enum ResourceType {
    MainFrame = 'main_frame',
    SubFrame = 'sub_frame',
    Stylesheet = 'stylesheet',
    Script = 'script',
    Image = 'image',
    Font = 'font',
    Object = 'object',
    XmlHttpRequest = 'xmlhttprequest',
    Ping = 'ping',
    CspReport = 'csp_report',
    Media = 'media',
    WebSocket = 'websocket',
    WebTransport = 'webtransport',
    WebBundle = 'webbundle',
    Other = 'other',
}

/**
 * https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-QueryKeyValue
 */
const QueryKeyValueValidator = zod.strictObject({
    key: zod.string(),
    replaceOnly: zod.boolean().optional(),
    value: zod.string(),
});

export type QueryKeyValue = zod.infer<typeof QueryKeyValueValidator>;

/**
 * https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-QueryTransform
 */
const QueryTransformValidator = zod.strictObject({
    addOrReplaceParams: QueryKeyValueValidator.array().optional(),
    removeParams: zod.string().array().optional(),
});

export type QueryTransform = zod.infer<typeof QueryTransformValidator>;

/**
 * https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-URLTransform
 */
const URLTransformValidator = zod.strictObject({
    fragment: zod.string().optional(),
    host: zod.string().optional(),
    password: zod.string().optional(),
    path: zod.string().optional(),
    port: zod.string().optional(),
    query: zod.string().optional(),
    queryTransform: QueryTransformValidator.optional(),
    scheme: zod.string().optional(),
    username: zod.string().optional(),
});

export type URLTransform = zod.infer<typeof URLTransformValidator>;

/**
 * https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-Redirect
 */
const RedirectValidator = zod.strictObject({
    extensionPath: zod.string().optional(),
    regexSubstitution: zod.string().optional(),
    transform: URLTransformValidator.optional(),
    url: zod.string().optional(),
});

export type Redirect = zod.infer<typeof RedirectValidator>;

/**
 * https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-HeaderOperation
 */
export enum HeaderOperation {
    Append = 'append',
    Set = 'set',
    Remove = 'remove',
}

/**
 * https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-ModifyHeaderInfo
 */
const ModifyHeaderInfoValidator = zod.strictObject({
    header: zod.string(),
    operation: zod.nativeEnum(HeaderOperation),
    value: zod.string().optional(),
});

export type ModifyHeaderInfo = zod.infer<typeof ModifyHeaderInfoValidator>;

/**
 * https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-RuleActionType
 */
export enum RuleActionType {
    BLOCK = 'block',
    REDIRECT = 'redirect',
    ALLOW = 'allow',
    UPGRADE_SCHEME = 'upgradeScheme',
    MODIFY_HEADERS = 'modifyHeaders',
    ALLOW_ALL_REQUESTS = 'allowAllRequests',
}

/**
 * https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-RuleAction
 */
const RuleActionValidator = zod.strictObject({
    redirect: RedirectValidator.optional(),
    requestHeaders: ModifyHeaderInfoValidator.array().optional(),
    responseHeaders: ModifyHeaderInfoValidator.array().optional(),
    type: zod.nativeEnum(RuleActionType),
});

export type RuleAction = zod.infer<typeof RuleActionValidator>;

/**
 * https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-RequestMethod
 */
export enum RequestMethod {
    Connect = 'connect',
    Delete = 'delete',
    Get = 'get',
    Head = 'head',
    Options = 'options',
    Patch = 'patch',
    Post = 'post',
    Put = 'put',
}

/**
 * https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-RuleCondition
 */

const RuleConditionValidator = zod.strictObject({
    domainType: zod.nativeEnum(DomainType).optional(),
    excludedInitiatorDomains: zod.string().array().optional(),
    excludedRequestDomains: zod.string().array().optional(),
    excludedRequestMethods: zod.nativeEnum(RequestMethod).array().optional(),
    excludedResourceTypes: zod.nativeEnum(ResourceType).array().optional(),
    excludedTabIds: zod.number().array().optional(),
    initiatorDomains: zod.string().array().optional(),
    isUrlFilterCaseSensitive: zod.boolean().optional(),
    regexFilter: zod.string().optional(),
    requestDomains: zod.string().array().optional(),
    requestMethods: zod.string().array().optional(),
    resourceTypes: zod.nativeEnum(ResourceType).array().optional(),
    tabIds: zod.number().array().optional(),
    urlFilter: zod.string().optional(),
});

export type RuleCondition = zod.infer<typeof RuleConditionValidator>;

/**
 * https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#type-Rule
 */
export const DeclarativeRuleValidator = zod.strictObject({
    action: RuleActionValidator,
    condition: RuleConditionValidator,
    id: zod.number(),
    priority: zod.number().optional(),
});

export type DeclarativeRule = zod.infer<typeof DeclarativeRuleValidator>;
