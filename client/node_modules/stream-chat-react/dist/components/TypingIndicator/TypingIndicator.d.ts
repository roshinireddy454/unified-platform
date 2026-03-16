import React from 'react';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type TypingIndicatorProps = {
    /** Whether the typing indicator is in a thread */
    threadList?: boolean;
};
export declare const TypingIndicator: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: TypingIndicatorProps) => React.JSX.Element | null;
