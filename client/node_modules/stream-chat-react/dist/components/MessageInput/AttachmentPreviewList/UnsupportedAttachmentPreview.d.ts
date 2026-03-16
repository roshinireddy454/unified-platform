import React from 'react';
import type { AttachmentPreviewProps } from './types';
import type { AnyLocalAttachment } from '../types';
import type { DefaultStreamChatGenerics } from '../../../types';
export type UnsupportedAttachmentPreviewProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, CustomLocalMetadata = Record<string, unknown>> = AttachmentPreviewProps<AnyLocalAttachment<StreamChatGenerics, CustomLocalMetadata>, StreamChatGenerics>;
export declare const UnsupportedAttachmentPreview: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ attachment, handleRetry, removeAttachments, }: UnsupportedAttachmentPreviewProps<StreamChatGenerics>) => React.JSX.Element;
