import type { Channel } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../types/types';
import type { StreamMessage } from '../../../context';
export declare enum MessageDeliveryStatus {
    DELIVERED = "delivered",
    READ = "read"
}
type UseMessageStatusParamsChannelPreviewProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    channel: Channel<StreamChatGenerics>;
    /** The last message received in a channel */
    lastMessage?: StreamMessage<StreamChatGenerics>;
};
export declare const useMessageDeliveryStatus: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ channel, lastMessage, }: UseMessageStatusParamsChannelPreviewProps<StreamChatGenerics>) => {
    messageDeliveryStatus: MessageDeliveryStatus | undefined;
};
export {};
