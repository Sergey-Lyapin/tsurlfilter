import { RequestType } from '@adguard/tsurlfilter';

import {
    hideRequestInitiatorElement,
    INITIATOR_TAG_HIDDEN_STYLE,
    BACKGROUND_TAB_ID,
    InitiatorTag,
} from '@lib/mv2/background/request/request-initiator-element';

import { CosmeticApi } from '@lib/mv2/background/cosmetic-api';

describe('Request Initiator Element', () => {
    beforeEach(() => {
        jest.spyOn(CosmeticApi, 'injectCss').mockImplementation(jest.fn);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('hides subdocument with third party src', () => {
        const tabId = 1;
        const frameId = 0;

        hideRequestInitiatorElement(tabId, frameId, 'https://example.org', RequestType.SubDocument, true);

        const expectedTags = [InitiatorTag.Iframe, InitiatorTag.Frame];

        let expectedCode = '';

        for (let i = 0; i < expectedTags.length; i += 1) {
            expectedCode += `${expectedTags[i]}[src$="//example.org"] ${INITIATOR_TAG_HIDDEN_STYLE}\n`;
        }

        expect(CosmeticApi.injectCss).toBeCalledWith(expectedCode, tabId, frameId);
    });

    it('hides image with third party src', () => {
        const tabId = 1;
        const frameId = 0;

        hideRequestInitiatorElement(tabId, frameId, 'https://example.org/image.png', RequestType.Image, true);

        const expectedCode = `${InitiatorTag.Image}[src$="//example.org/image.png"] ${INITIATOR_TAG_HIDDEN_STYLE}\n`;

        expect(CosmeticApi.injectCss).toBeCalledWith(expectedCode, tabId, frameId);
    });

    it('hides image with first party src', () => {
        const tabId = 1;
        const frameId = 0;

        hideRequestInitiatorElement(tabId, frameId, 'https://example.org/image.png', RequestType.Image, false);

        const expectedCode = `${InitiatorTag.Image}[src$="/image.png"] ${INITIATOR_TAG_HIDDEN_STYLE}\n`;

        expect(CosmeticApi.injectCss).toBeCalledWith(expectedCode, tabId, frameId);
    });

    it('doesn`t inject css on background tab', () => {
        hideRequestInitiatorElement(
            BACKGROUND_TAB_ID,
            0,
            'https://example.org/image.png',
            RequestType.Image,
            true,
        );

        expect(CosmeticApi.injectCss).toBeCalledTimes(0);
    });

    it('doesn`t inject css for unsupported request types', () => {
        hideRequestInitiatorElement(1, 0, 'https://example.org/image.png', RequestType.XmlHttpRequest, true);

        expect(CosmeticApi.injectCss).toBeCalledTimes(0);
    });
});