import React from 'react';
import type { DefaultStreamChatGenerics } from '../../../types';
export type AddCommentFormProps = {
    close: () => void;
    messageId: string;
};
export declare const AddCommentForm: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ close, messageId, }: AddCommentFormProps) => React.JSX.Element;
