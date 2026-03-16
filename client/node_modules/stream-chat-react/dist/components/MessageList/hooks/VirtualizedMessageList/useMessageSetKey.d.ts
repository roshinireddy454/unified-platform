import { StreamMessage } from '../../../../context';
import { DefaultStreamChatGenerics } from '../../../../types/types';
type UseMessageSetKeyParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    messages?: StreamMessage<StreamChatGenerics>[];
};
export declare const useMessageSetKey: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ messages, }: UseMessageSetKeyParams<StreamChatGenerics>) => {
    messageSetKey: number;
};
export {};
