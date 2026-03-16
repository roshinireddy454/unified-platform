import React from 'react';
import { StreamMessage } from '../../context';
import { DefaultStreamChatGenerics } from '../../types/types';
export interface MessageErrorTextProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> {
    message: StreamMessage<StreamChatGenerics>;
    theme: string;
}
export declare function MessageErrorText<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ message, theme }: MessageErrorTextProps<StreamChatGenerics>): React.JSX.Element | null;
