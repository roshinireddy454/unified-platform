import React, { PropsWithChildren } from 'react';
import type { UserResponse } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../../types/types';
export type MentionProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = PropsWithChildren<{
    node: {
        mentionedUser: UserResponse<StreamChatGenerics>;
    };
}>;
export declare const Mention: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ children, node: { mentionedUser }, }: MentionProps<StreamChatGenerics>) => React.JSX.Element;
