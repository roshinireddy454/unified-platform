import React from 'react';
import type { DefaultStreamChatGenerics } from '../../../types';
export type EndPollDialogProps = {
    close: () => void;
};
export declare const EndPollDialog: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ close, }: EndPollDialogProps) => React.JSX.Element;
