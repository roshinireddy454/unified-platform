import React, { ComponentType } from 'react';
import { UnsupportedAttachmentPreviewProps } from './UnsupportedAttachmentPreview';
import { VoiceRecordingPreviewProps } from './VoiceRecordingPreview';
import { FileAttachmentPreviewProps } from './FileAttachmentPreview';
import { ImageAttachmentPreviewProps } from './ImageAttachmentPreview';
import type { DefaultStreamChatGenerics } from '../../../types';
export type AttachmentPreviewListProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    AudioAttachmentPreview?: ComponentType<FileAttachmentPreviewProps>;
    FileAttachmentPreview?: ComponentType<FileAttachmentPreviewProps>;
    ImageAttachmentPreview?: ComponentType<ImageAttachmentPreviewProps<StreamChatGenerics>>;
    UnsupportedAttachmentPreview?: ComponentType<UnsupportedAttachmentPreviewProps<StreamChatGenerics>>;
    VideoAttachmentPreview?: ComponentType<FileAttachmentPreviewProps>;
    VoiceRecordingPreview?: ComponentType<VoiceRecordingPreviewProps<StreamChatGenerics>>;
};
export declare const AttachmentPreviewList: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ AudioAttachmentPreview, FileAttachmentPreview, ImageAttachmentPreview, UnsupportedAttachmentPreview, VideoAttachmentPreview, VoiceRecordingPreview, }: AttachmentPreviewListProps<StreamChatGenerics>) => React.JSX.Element;
