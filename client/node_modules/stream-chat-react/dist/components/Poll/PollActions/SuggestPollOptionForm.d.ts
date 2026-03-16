import React from 'react';
import type { DefaultStreamChatGenerics } from '../../../types';
export type SuggestPollOptionFormProps = {
    close: () => void;
    messageId: string;
};
export declare const SuggestPollOptionForm: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ close, messageId, }: SuggestPollOptionFormProps) => React.JSX.Element;
