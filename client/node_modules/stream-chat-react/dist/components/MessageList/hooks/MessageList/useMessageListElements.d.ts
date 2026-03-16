import React from 'react';
import { GroupStyle } from '../../utils';
import type { ChannelState as StreamChannelState } from 'stream-chat';
import type { StreamMessage } from '../../../../context/ChannelStateContext';
import type { ChannelUnreadUiState, DefaultStreamChatGenerics } from '../../../../types/types';
import { MessageRenderer, SharedMessageProps } from '../../renderMessages';
type UseMessageListElementsProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    enrichedMessages: StreamMessage<StreamChatGenerics>[];
    internalMessageProps: SharedMessageProps<StreamChatGenerics>;
    messageGroupStyles: Record<string, GroupStyle>;
    renderMessages: MessageRenderer<StreamChatGenerics>;
    returnAllReadData: boolean;
    threadList: boolean;
    channelUnreadUiState?: ChannelUnreadUiState<StreamChatGenerics>;
    read?: StreamChannelState<StreamChatGenerics>['read'];
};
export declare const useMessageListElements: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: UseMessageListElementsProps<StreamChatGenerics>) => React.ReactNode[];
export {};
