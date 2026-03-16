import React, { PropsWithChildren } from 'react';
import type { Channel, ChannelConfigWithInfo, MessageResponse, Mute, ChannelState as StreamChannelState } from 'stream-chat';
import type { ChannelUnreadUiState, DefaultStreamChatGenerics, GiphyVersions, ImageAttachmentSizeHandler, UnknownType, VideoAttachmentSizeHandler } from '../types/types';
import type { URLEnrichmentConfig } from '../components/MessageInput/hooks/useLinkPreviews';
export type ChannelNotifications = Array<{
    id: string;
    text: string;
    type: 'success' | 'error';
}>;
export type StreamMessage<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = ReturnType<StreamChannelState<StreamChatGenerics>['formatMessage']> | MessageResponse<StreamChatGenerics>;
export type ChannelState<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    suppressAutoscroll: boolean;
    error?: Error | null;
    hasMore?: boolean;
    hasMoreNewer?: boolean;
    highlightedMessageId?: string;
    loading?: boolean;
    loadingMore?: boolean;
    loadingMoreNewer?: boolean;
    members?: StreamChannelState<StreamChatGenerics>['members'];
    messages?: StreamMessage<StreamChatGenerics>[];
    pinnedMessages?: StreamMessage<StreamChatGenerics>[];
    quotedMessage?: StreamMessage<StreamChatGenerics>;
    read?: StreamChannelState<StreamChatGenerics>['read'];
    thread?: StreamMessage<StreamChatGenerics> | null;
    threadHasMore?: boolean;
    threadLoadingMore?: boolean;
    threadMessages?: StreamMessage<StreamChatGenerics>[];
    threadSuppressAutoscroll?: boolean;
    typing?: StreamChannelState<StreamChatGenerics>['typing'];
    watcherCount?: number;
    watchers?: StreamChannelState<StreamChatGenerics>['watchers'];
};
export type ChannelStateContextValue<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Omit<ChannelState<StreamChatGenerics>, 'typing'> & {
    channel: Channel<StreamChatGenerics>;
    channelCapabilities: Record<string, boolean>;
    channelConfig: ChannelConfigWithInfo<StreamChatGenerics> | undefined;
    imageAttachmentSizeHandler: ImageAttachmentSizeHandler;
    multipleUploads: boolean;
    notifications: ChannelNotifications;
    shouldGenerateVideoThumbnail: boolean;
    videoAttachmentSizeHandler: VideoAttachmentSizeHandler;
    acceptedFiles?: string[];
    channelUnreadUiState?: ChannelUnreadUiState<StreamChatGenerics>;
    debounceURLEnrichmentMs?: URLEnrichmentConfig['debounceURLEnrichmentMs'];
    dragAndDropWindow?: boolean;
    enrichURLForPreview?: URLEnrichmentConfig['enrichURLForPreview'];
    findURLFn?: URLEnrichmentConfig['findURLFn'];
    giphyVersion?: GiphyVersions;
    maxNumberOfFiles?: number;
    mutes?: Array<Mute<StreamChatGenerics>>;
    onLinkPreviewDismissed?: URLEnrichmentConfig['onLinkPreviewDismissed'];
    watcher_count?: number;
};
export declare const ChannelStateContext: React.Context<ChannelStateContextValue<DefaultStreamChatGenerics> | undefined>;
export declare const ChannelStateProvider: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ children, value, }: PropsWithChildren<{
    value: ChannelStateContextValue<StreamChatGenerics>;
}>) => React.JSX.Element;
export declare const useChannelStateContext: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(componentName?: string) => ChannelStateContextValue<StreamChatGenerics>;
/**
 * Typescript currently does not support partial inference, so if ChannelStateContext
 * typing is desired while using the HOC withChannelStateContext, the Props for the
 * wrapped component must be provided as the first generic.
 */
export declare const withChannelStateContext: <P extends UnknownType, StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(Component: React.ComponentType<P>) => {
    (props: Omit<P, keyof ChannelStateContextValue<StreamChatGenerics>>): React.JSX.Element;
    displayName: string;
};
