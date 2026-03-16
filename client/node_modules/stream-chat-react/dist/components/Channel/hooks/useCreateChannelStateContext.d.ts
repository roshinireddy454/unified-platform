import type { ChannelStateContextValue } from '../../../context/ChannelStateContext';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export declare const useCreateChannelStateContext: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(value: Omit<ChannelStateContextValue<StreamChatGenerics>, 'channelCapabilities'> & {
    channelCapabilitiesArray: string[];
    skipMessageDataMemoization?: boolean;
}) => ChannelStateContextValue<StreamChatGenerics>;
