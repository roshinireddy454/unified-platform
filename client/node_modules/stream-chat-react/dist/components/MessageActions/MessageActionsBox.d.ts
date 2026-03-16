import React, { ComponentProps } from 'react';
import { MessageContextValue } from '../../context';
import type { DefaultStreamChatGenerics } from '../../types/types';
type PropsDrilledToMessageActionsBox = 'getMessageActions' | 'handleDelete' | 'handleEdit' | 'handleMarkUnread' | 'handleFlag' | 'handleMute' | 'handlePin';
export type MessageActionsBoxProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Pick<MessageContextValue<StreamChatGenerics>, PropsDrilledToMessageActionsBox> & {
    isUserMuted: () => boolean;
    mine: boolean;
    open: boolean;
} & ComponentProps<'div'>;
/**
 * A popup box that displays the available actions on a message, such as edit, delete, pin, etc.
 */
export declare const MessageActionsBox: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: MessageActionsBoxProps<StreamChatGenerics>) => React.JSX.Element;
export {};
