import React from 'react';
import type { UserResponse } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export type OnMentionAction<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = (event: React.BaseSyntheticEvent, user?: UserResponse<StreamChatGenerics>) => void;
export declare const useMentionsHandlers: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(onMentionsHover?: OnMentionAction<StreamChatGenerics>, onMentionsClick?: OnMentionAction<StreamChatGenerics>) => (event: React.BaseSyntheticEvent, mentioned_users: UserResponse<StreamChatGenerics>[]) => void;
