import React, { ReactNode } from 'react';
import type { Channel, UserResponse } from 'stream-chat';
import type { TranslationContextValue } from '../../context/TranslationContext';
import type { DefaultStreamChatGenerics } from '../../types/types';
import { ChatContextValue } from '../../context';
export declare const renderPreviewText: (text: string) => React.JSX.Element;
export declare const getLatestMessagePreview: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(channel: Channel<StreamChatGenerics>, t: TranslationContextValue['t'], userLanguage?: TranslationContextValue['userLanguage'], isMessageAIGenerated?: ChatContextValue<StreamChatGenerics>['isMessageAIGenerated']) => ReactNode;
export type GroupChannelDisplayInfo = {
    image?: string;
    name?: string;
}[];
export declare const getGroupChannelDisplayInfo: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(channel: Channel<StreamChatGenerics>) => GroupChannelDisplayInfo | undefined;
export declare const getDisplayTitle: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(channel: Channel<StreamChatGenerics>, currentUser?: UserResponse<StreamChatGenerics>) => string | undefined;
export declare const getDisplayImage: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(channel: Channel<StreamChatGenerics>, currentUser?: UserResponse<StreamChatGenerics>) => string | undefined;
