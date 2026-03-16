import type { Nodes } from 'hast-util-find-and-replace/lib';
import type { UserResponse } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../../types';
export declare const mentionsMarkdownPlugin: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(mentioned_users: UserResponse<StreamChatGenerics>[]) => () => (tree: Nodes) => void;
