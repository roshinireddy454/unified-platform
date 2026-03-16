import React from 'react';
import type { Attachment } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../types';
export type VoiceRecordingPlayerProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Pick<VoiceRecordingProps<StreamChatGenerics>, 'attachment'> & {
    /** An array of fractional numeric values of playback speed to override the defaults (1.0, 1.5, 2.0) */
    playbackRates?: number[];
};
export declare const VoiceRecordingPlayer: ({ attachment, playbackRates, }: VoiceRecordingPlayerProps) => React.JSX.Element | null;
export type QuotedVoiceRecordingProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Pick<VoiceRecordingProps<StreamChatGenerics>, 'attachment'>;
export declare const QuotedVoiceRecording: ({ attachment }: QuotedVoiceRecordingProps) => React.JSX.Element;
export type VoiceRecordingProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    /** The attachment object from the message's attachment list. */
    attachment: Attachment<StreamChatGenerics>;
    /** A boolean flag to signal whether the attachment will be rendered inside the quoted reply. */
    isQuoted?: boolean;
};
export declare const VoiceRecording: ({ attachment, isQuoted }: VoiceRecordingProps) => React.JSX.Element;
