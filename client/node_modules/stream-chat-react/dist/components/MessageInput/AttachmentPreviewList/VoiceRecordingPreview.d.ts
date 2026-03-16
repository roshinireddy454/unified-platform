import React from 'react';
import type { AttachmentPreviewProps } from './types';
import type { LocalVoiceRecordingAttachment } from '../types';
import type { DefaultStreamChatGenerics } from '../../../types';
export type VoiceRecordingPreviewProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, CustomLocalMetadata = Record<string, unknown>> = AttachmentPreviewProps<LocalVoiceRecordingAttachment<StreamChatGenerics, CustomLocalMetadata>, StreamChatGenerics>;
export declare const VoiceRecordingPreview: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ attachment, handleRetry, removeAttachments, }: VoiceRecordingPreviewProps<StreamChatGenerics>) => React.JSX.Element;
