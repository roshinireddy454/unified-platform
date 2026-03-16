/// <reference types="react" />
import type { Channel, ChannelFilters, ChannelOptions, ChannelSort, StreamChat } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../types/types';
import type { ChannelsQueryState } from '../../Chat/hooks/useChannelsQueryState';
type AllowedQueryType = Extract<ChannelsQueryState['queryInProgress'], 'reload' | 'load-more'>;
export type CustomQueryChannelParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    currentChannels: Array<Channel<StreamChatGenerics>>;
    queryType: AllowedQueryType;
    setChannels: React.Dispatch<React.SetStateAction<Array<Channel<StreamChatGenerics>>>>;
    setHasNextPage: React.Dispatch<React.SetStateAction<boolean>>;
};
export type CustomQueryChannelsFn<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = (params: CustomQueryChannelParams<StreamChatGenerics>) => Promise<void>;
export declare const usePaginatedChannels: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(client: StreamChat<StreamChatGenerics>, filters: ChannelFilters<StreamChatGenerics>, sort: ChannelSort<StreamChatGenerics>, options: ChannelOptions, activeChannelHandler: (channels: Array<Channel<StreamChatGenerics>>, setChannels: React.Dispatch<React.SetStateAction<Array<Channel<StreamChatGenerics>>>>) => void, recoveryThrottleIntervalMs?: number, customQueryChannels?: CustomQueryChannelsFn<StreamChatGenerics>) => {
    channels: Channel<StreamChatGenerics>[];
    hasNextPage: boolean;
    loadNextPage: () => void;
    setChannels: import("react").Dispatch<import("react").SetStateAction<Channel<StreamChatGenerics>[]>>;
};
export {};
