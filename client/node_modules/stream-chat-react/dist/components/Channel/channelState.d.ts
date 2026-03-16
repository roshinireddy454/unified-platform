import type { Channel, MessageResponse, ChannelState as StreamChannelState } from 'stream-chat';
import type { ChannelState, StreamMessage } from '../../context/ChannelStateContext';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type ChannelStateReducerAction<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    type: 'closeThread';
} | {
    type: 'clearHighlightedMessage';
} | {
    channel: Channel<StreamChatGenerics>;
    type: 'copyMessagesFromChannel';
    parentId?: string | null;
} | {
    channel: Channel<StreamChatGenerics>;
    type: 'copyStateFromChannelOnEvent';
} | {
    channel: Channel<StreamChatGenerics>;
    highlightedMessageId: string;
    type: 'jumpToMessageFinished';
} | {
    channel: Channel<StreamChatGenerics>;
    hasMore: boolean;
    type: 'initStateFromChannel';
} | {
    hasMore: boolean;
    messages: StreamMessage<StreamChatGenerics>[];
    type: 'loadMoreFinished';
} | {
    hasMoreNewer: boolean;
    messages: StreamMessage<StreamChatGenerics>[];
    type: 'loadMoreNewerFinished';
} | {
    threadHasMore: boolean;
    threadMessages: Array<ReturnType<StreamChannelState<StreamChatGenerics>['formatMessage']>>;
    type: 'loadMoreThreadFinished';
} | {
    channel: Channel<StreamChatGenerics>;
    message: StreamMessage<StreamChatGenerics>;
    type: 'openThread';
} | {
    error: Error;
    type: 'setError';
} | {
    loadingMore: boolean;
    type: 'setLoadingMore';
} | {
    loadingMoreNewer: boolean;
    type: 'setLoadingMoreNewer';
} | {
    message: StreamMessage<StreamChatGenerics>;
    type: 'setThread';
} | {
    channel: Channel<StreamChatGenerics>;
    type: 'setTyping';
} | {
    type: 'startLoadingThread';
} | {
    channel: Channel<StreamChatGenerics>;
    message: MessageResponse<StreamChatGenerics>;
    type: 'updateThreadOnEvent';
} | {
    type: 'jumpToLatestMessage';
};
export declare const makeChannelReducer: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>() => (state: ChannelState<StreamChatGenerics>, action: ChannelStateReducerAction<StreamChatGenerics>) => ChannelState<StreamChatGenerics>;
export declare const initialState: {
    error: null;
    hasMore: boolean;
    hasMoreNewer: boolean;
    loading: boolean;
    loadingMore: boolean;
    members: {};
    messages: never[];
    pinnedMessages: never[];
    read: {};
    suppressAutoscroll: boolean;
    thread: null;
    threadHasMore: boolean;
    threadLoadingMore: boolean;
    threadMessages: never[];
    threadSuppressAutoscroll: boolean;
    typing: {};
    watcherCount: number;
    watchers: {};
};
