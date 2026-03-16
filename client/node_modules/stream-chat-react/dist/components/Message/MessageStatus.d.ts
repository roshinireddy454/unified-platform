import React from 'react';
import { TooltipUsernameMapper } from './utils';
import { AvatarProps } from '../Avatar';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type MessageStatusProps = {
    Avatar?: React.ComponentType<AvatarProps>;
    MessageDeliveredStatus?: React.ComponentType;
    MessageReadStatus?: React.ComponentType;
    MessageSendingStatus?: React.ComponentType;
    messageType?: string;
    tooltipUserNameMapper?: TooltipUsernameMapper;
};
export declare const MessageStatus: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: MessageStatusProps) => React.JSX.Element | null;
