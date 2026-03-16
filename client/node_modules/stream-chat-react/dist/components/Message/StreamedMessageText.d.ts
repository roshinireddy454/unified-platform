import React from 'react';
import { MessageTextProps } from './MessageText';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type StreamedMessageTextProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Pick<MessageTextProps<StreamChatGenerics>, 'message' | 'renderText'> & {
    renderingLetterCount?: number;
    streamingLetterIntervalMs?: number;
};
export declare const StreamedMessageText: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: StreamedMessageTextProps<StreamChatGenerics>) => React.JSX.Element;
