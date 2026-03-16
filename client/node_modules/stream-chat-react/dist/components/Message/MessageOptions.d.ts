import React from 'react';
import type { DefaultStreamChatGenerics, IconProps } from '../../types/types';
import type { MessageContextValue } from '../../context/MessageContext';
export type MessageOptionsProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Partial<Pick<MessageContextValue<StreamChatGenerics>, 'handleOpenThread'>> & {
    ActionsIcon?: React.ComponentType<IconProps>;
    displayReplies?: boolean;
    ReactionIcon?: React.ComponentType<IconProps>;
    theme?: string;
    ThreadIcon?: React.ComponentType<IconProps>;
};
export declare const MessageOptions: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: MessageOptionsProps<StreamChatGenerics>) => React.JSX.Element | null;
