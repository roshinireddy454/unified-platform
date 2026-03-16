import type { EmojiTriggerSetting } from '../DefaultTriggerProvider';
import type { EmojiSearchIndex } from '../MessageInput';
export declare const useEmojiTrigger: <T extends EmojiSearchIndex<import("../../../types/types").UnknownType>>(emojiSearchIndex?: T) => EmojiTriggerSetting;
