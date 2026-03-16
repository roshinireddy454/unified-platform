import React, { ReactNode } from 'react';
import { ChatContextValue } from '../../context/ChatContext';
import { MessageDeliveryStatus } from './hooks/useMessageDeliveryStatus';
import type { Channel } from 'stream-chat';
import type { ChannelAvatarProps } from '../Avatar/ChannelAvatar';
import type { GroupChannelDisplayInfo } from './utils';
import type { StreamMessage } from '../../context/ChannelStateContext';
import type { TranslationContextValue } from '../../context/TranslationContext';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type ChannelPreviewUIComponentProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = ChannelPreviewProps<StreamChatGenerics> & {
    /** Image of Channel to display */
    displayImage?: string;
    /** Title of Channel to display */
    displayTitle?: string;
    /** Title of Channel to display */
    groupChannelDisplayInfo?: GroupChannelDisplayInfo;
    /** The last message received in a channel */
    lastMessage?: StreamMessage<StreamChatGenerics>;
    /** @deprecated Use latestMessagePreview prop instead. */
    latestMessage?: ReactNode;
    /** Latest message preview to display, will be a string or JSX element supporting markdown. */
    latestMessagePreview?: ReactNode;
    /** Status describing whether own message has been delivered or read by another. If the last message is not an own message, then the status is undefined. */
    messageDeliveryStatus?: MessageDeliveryStatus;
    /** Number of unread Messages */
    unread?: number;
};
export type ChannelPreviewProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    /** Comes from either the `channelRenderFilterFn` or `usePaginatedChannels` call from [ChannelList](https://github.com/GetStream/stream-chat-react/blob/master/src/components/ChannelList/ChannelList.tsx) */
    channel: Channel<StreamChatGenerics>;
    /** If the component's channel is the active (selected) Channel */
    active?: boolean;
    /** Current selected channel object */
    activeChannel?: Channel<StreamChatGenerics>;
    /** UI component to display an avatar, defaults to [Avatar](https://github.com/GetStream/stream-chat-react/blob/master/src/components/Avatar/Avatar.tsx) component and accepts the same props as: [ChannelAvatar](https://github.com/GetStream/stream-chat-react/blob/master/src/components/Avatar/ChannelAvatar.tsx) */
    Avatar?: React.ComponentType<ChannelAvatarProps<StreamChatGenerics>>;
    /** Forces the update of preview component on channel update */
    channelUpdateCount?: number;
    /** Custom class for the channel preview root */
    className?: string;
    /** Custom function that generates the message preview in ChannelPreview component */
    getLatestMessagePreview?: (channel: Channel<StreamChatGenerics>, t: TranslationContextValue['t'], userLanguage: TranslationContextValue['userLanguage']) => ReactNode;
    key?: string;
    /** Custom ChannelPreview click handler function */
    onSelect?: (event: React.MouseEvent) => void;
    /** Custom UI component to display the channel preview in the list, defaults to and accepts same props as: [ChannelPreviewMessenger](https://github.com/GetStream/stream-chat-react/blob/master/src/components/ChannelPreview/ChannelPreviewMessenger.tsx) */
    Preview?: React.ComponentType<ChannelPreviewUIComponentProps<StreamChatGenerics>>;
    /** Setter for selected Channel */
    setActiveChannel?: ChatContextValue<StreamChatGenerics>['setActiveChannel'];
    /** Object containing watcher parameters */
    watchers?: {
        limit?: number;
        offset?: number;
    };
};
export declare const ChannelPreview: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: ChannelPreviewProps<StreamChatGenerics>) => React.JSX.Element | null;
