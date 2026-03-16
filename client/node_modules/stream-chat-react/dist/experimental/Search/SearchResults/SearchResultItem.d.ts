import React, { ComponentType } from 'react';
import type { Channel, MessageResponse, User } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../types';
export type ChannelSearchResultItemProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    item: Channel<StreamChatGenerics>;
};
export declare const ChannelSearchResultItem: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ item, }: ChannelSearchResultItemProps<StreamChatGenerics>) => React.JSX.Element;
export type ChannelByMessageSearchResultItemProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    item: MessageResponse<StreamChatGenerics>;
};
export declare const MessageSearchResultItem: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ item, }: ChannelByMessageSearchResultItemProps<StreamChatGenerics>) => React.JSX.Element | undefined;
export type UserSearchResultItemProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    item: User<StreamChatGenerics>;
};
export declare const UserSearchResultItem: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ item, }: UserSearchResultItemProps<StreamChatGenerics>) => React.JSX.Element;
export type SearchResultItemComponents = Record<string, ComponentType<{
    item: any;
}>>;
export declare const DefaultSearchResultItems: SearchResultItemComponents;
