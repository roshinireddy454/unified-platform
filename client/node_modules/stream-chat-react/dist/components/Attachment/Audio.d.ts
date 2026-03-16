import React from 'react';
import type { Attachment } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type AudioProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    og: Attachment<StreamChatGenerics>;
};
/**
 * Audio attachment with play/pause button and progress bar
 */
export declare const Audio: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: AudioProps<StreamChatGenerics>) => React.JSX.Element | null;
