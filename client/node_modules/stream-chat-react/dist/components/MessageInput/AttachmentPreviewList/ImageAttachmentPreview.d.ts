import React from 'react';
import type { AttachmentPreviewProps } from './types';
import type { LocalImageAttachment } from '../types';
import type { DefaultStreamChatGenerics } from '../../../types';
export type ImageAttachmentPreviewProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, CustomLocalMetadata = Record<string, unknown>> = AttachmentPreviewProps<LocalImageAttachment<StreamChatGenerics, CustomLocalMetadata>, StreamChatGenerics>;
export declare const ImageAttachmentPreview: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ attachment, handleRetry, removeAttachments, }: ImageAttachmentPreviewProps<StreamChatGenerics>) => React.JSX.Element;
