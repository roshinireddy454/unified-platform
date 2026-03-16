import React from 'react';
import type { AttachmentPreviewProps } from './types';
import { LocalAttachmentCast, LocalAttachmentUploadMetadata } from '../types';
import type { DefaultStreamChatGenerics } from '../../../types';
type FileLikeAttachment = {
    asset_url?: string;
    file_size?: number;
    mime_type?: string;
    title?: string;
};
export type FileAttachmentPreviewProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, CustomLocalMetadata = Record<string, unknown>> = AttachmentPreviewProps<LocalAttachmentCast<FileLikeAttachment, LocalAttachmentUploadMetadata & CustomLocalMetadata>, StreamChatGenerics>;
export declare const FileAttachmentPreview: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ attachment, handleRetry, removeAttachments, }: FileAttachmentPreviewProps<StreamChatGenerics>) => React.JSX.Element;
export {};
