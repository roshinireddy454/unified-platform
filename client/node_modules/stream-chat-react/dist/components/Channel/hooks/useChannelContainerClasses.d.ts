import type { ChatContextValue } from '../../../context/ChatContext';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export declare const useImageFlagEmojisOnWindowsClass: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>() => "" | "str-chat--windows-flags";
export declare const getChatContainerClass: (customClass?: string) => string;
export declare const useChannelContainerClasses: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ customClasses, }: Pick<ChatContextValue, 'customClasses'>) => {
    channelClass: string;
    chatClass: string;
    chatContainerClass: string;
    windowsEmojiClass: string;
};
