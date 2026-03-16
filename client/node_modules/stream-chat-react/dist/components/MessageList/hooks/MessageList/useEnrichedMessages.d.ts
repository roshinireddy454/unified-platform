import { GroupStyle, ProcessMessagesParams } from '../../utils';
import type { Channel } from 'stream-chat';
import type { StreamMessage } from '../../../../context/ChannelStateContext';
import type { DefaultStreamChatGenerics } from '../../../../types/types';
export declare const useEnrichedMessages: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(args: {
    channel: Channel<StreamChatGenerics>;
    disableDateSeparator: boolean;
    hideDeletedMessages: boolean;
    hideNewMessageSeparator: boolean;
    messages: StreamMessage<StreamChatGenerics>[];
    noGroupByUser: boolean;
    groupStyles?: (message: StreamMessage<StreamChatGenerics>, previousMessage: StreamMessage<StreamChatGenerics>, nextMessage: StreamMessage<StreamChatGenerics>, noGroupByUser: boolean, maxTimeBetweenGroupedMessages?: number) => GroupStyle;
    headerPosition?: number;
    maxTimeBetweenGroupedMessages?: number;
    reviewProcessedMessage?: ProcessMessagesParams<StreamChatGenerics>['reviewProcessedMessage'];
}) => {
    messageGroupStyles: Record<string, GroupStyle>;
    messages: StreamMessage<StreamChatGenerics>[];
};
