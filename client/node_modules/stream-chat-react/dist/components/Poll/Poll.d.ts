import React from 'react';
import type { Poll as PollClass } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../types';
export declare const Poll: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ isQuoted, poll, }: {
    poll: PollClass<StreamChatGenerics>;
    isQuoted?: boolean;
}) => React.JSX.Element | null;
