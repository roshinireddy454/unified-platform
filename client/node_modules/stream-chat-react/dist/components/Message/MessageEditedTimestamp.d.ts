import React from 'react';
import type { DefaultStreamChatGenerics } from '../../types';
import type { MessageTimestampProps } from './MessageTimestamp';
export type MessageEditedTimestampProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = MessageTimestampProps<StreamChatGenerics> & {
    open: boolean;
};
export declare function MessageEditedTimestamp<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ message: propMessage, open, ...timestampProps }: MessageEditedTimestampProps<StreamChatGenerics>): React.JSX.Element | null;
