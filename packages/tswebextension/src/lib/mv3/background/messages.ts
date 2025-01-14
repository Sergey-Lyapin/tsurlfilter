import { z as zod } from 'zod';

import {
    messageValidator as commonMessageValidator,
    MessageType as CommonMessageType,
} from '../../common';

enum ExtendedMV3MessageType {
    GetCollectedLog = 'GET_COLLECTED_LOG',
}

export { CommonMessageType, ExtendedMV3MessageType };

export const messageMV3Validator = commonMessageValidator.extend({
    type: zod.nativeEnum(CommonMessageType).or(zod.nativeEnum(ExtendedMV3MessageType)),
});

export type MessageMV3 = zod.infer<typeof messageMV3Validator>;
