import { StreamMessage } from '../../../../context';
import { DefaultStreamChatGenerics } from '../../../../types/types';
type UseScrollToBottomOnNewMessageParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    scrollToBottom: () => void;
    messages?: StreamMessage<StreamChatGenerics>[];
    /** When `true`, the list will scroll to the latest message when the window regains focus */
    scrollToLatestMessageOnFocus?: boolean;
};
export declare const useScrollToBottomOnNewMessage: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ messages, scrollToBottom, scrollToLatestMessageOnFocus, }: UseScrollToBottomOnNewMessageParams<StreamChatGenerics>) => void;
export {};
