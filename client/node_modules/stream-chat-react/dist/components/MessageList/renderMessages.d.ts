import React, { ReactNode } from 'react';
import type { UserResponse } from 'stream-chat';
import { GroupStyle } from './utils';
import { ComponentContextValue, CustomClasses } from '../../context';
import type { ChannelUnreadUiState, DefaultStreamChatGenerics } from '../../types';
import type { StreamMessage } from '../../context/ChannelStateContext';
import type { MessageProps } from '../Message';
export interface RenderMessagesOptions<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> {
    components: ComponentContextValue<StreamChatGenerics>;
    lastReceivedMessageId: string | null;
    messageGroupStyles: Record<string, GroupStyle>;
    messages: Array<StreamMessage<StreamChatGenerics>>;
    /**
     * Object mapping message IDs of own messages to the users who read those messages.
     */
    readData: Record<string, Array<UserResponse<StreamChatGenerics>>>;
    /**
     * Props forwarded to the Message component.
     */
    sharedMessageProps: SharedMessageProps<StreamChatGenerics>;
    /**
     * Current user's channel read state used to render components reflecting unread state.
     * It does not reflect the back-end state if a channel is marked read on mount.
     * This is in order to keep the unread UI when an unread channel is open.
     */
    channelUnreadUiState?: ChannelUnreadUiState<StreamChatGenerics>;
    customClasses?: CustomClasses;
}
export type SharedMessageProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Omit<MessageProps<StreamChatGenerics>, MessagePropsToOmit>;
export type MessageRenderer<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = (options: RenderMessagesOptions<StreamChatGenerics>) => Array<ReactNode>;
type MessagePropsToOmit = 'channel' | 'groupStyles' | 'initialMessage' | 'lastReceivedId' | 'message' | 'readBy';
export declare function defaultRenderMessages<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ channelUnreadUiState, components, customClasses, lastReceivedMessageId: lastReceivedId, messageGroupStyles, messages, readData, sharedMessageProps: messageProps, }: RenderMessagesOptions<StreamChatGenerics>): React.JSX.Element[];
export {};
