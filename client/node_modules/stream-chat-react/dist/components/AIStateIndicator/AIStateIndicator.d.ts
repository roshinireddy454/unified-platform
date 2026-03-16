import React from 'react';
import { Channel } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type AIStateIndicatorProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    channel?: Channel<StreamChatGenerics>;
};
export declare const AIStateIndicator: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ channel: channelFromProps, }: AIStateIndicatorProps<StreamChatGenerics>) => React.JSX.Element | null;
