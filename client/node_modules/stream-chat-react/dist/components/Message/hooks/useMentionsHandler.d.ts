import type React from 'react';
import type { UserResponse } from 'stream-chat';
import type { ReactEventHandler } from '../types';
import type { StreamMessage } from '../../../context/ChannelStateContext';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export type CustomMentionHandler<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = (event: React.BaseSyntheticEvent, mentioned_users: UserResponse<StreamChatGenerics>[]) => void;
export type MentionedUserEventHandler<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = (event: React.BaseSyntheticEvent, mentionedUsers: UserResponse<StreamChatGenerics>[]) => void;
export declare const useMentionsHandler: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(message?: StreamMessage<StreamChatGenerics>, customMentionHandler?: {
    onMentionsClick?: CustomMentionHandler<StreamChatGenerics>;
    onMentionsHover?: CustomMentionHandler<StreamChatGenerics>;
}) => {
    onMentionsClick: ReactEventHandler;
    onMentionsHover: ReactEventHandler;
};
