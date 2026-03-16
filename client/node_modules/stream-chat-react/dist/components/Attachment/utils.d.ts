import { ReactNode } from 'react';
import type { Attachment } from 'stream-chat';
import type { ATTACHMENT_GROUPS_ORDER, AttachmentProps } from './Attachment';
import type { DefaultStreamChatGenerics, UnknownType } from '../../types/types';
import type { LocalAttachment, LocalAudioAttachment, LocalFileAttachment, LocalImageAttachment, LocalVideoAttachment, LocalVoiceRecordingAttachment, VoiceRecordingAttachment } from '../MessageInput';
export declare const SUPPORTED_VIDEO_FORMATS: string[];
export type AttachmentComponentType = (typeof ATTACHMENT_GROUPS_ORDER)[number];
export type GroupedRenderedAttachment = Record<AttachmentComponentType, ReactNode[]>;
export type GalleryAttachment<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    images: Attachment<StreamChatGenerics>[];
    type: 'gallery';
};
export type RenderAttachmentProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Omit<AttachmentProps<StreamChatGenerics>, 'attachments'> & {
    attachment: Attachment<StreamChatGenerics>;
};
export type RenderGalleryProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Omit<AttachmentProps<StreamChatGenerics>, 'attachments'> & {
    attachment: GalleryAttachment<StreamChatGenerics>;
};
export declare const isLocalAttachment: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(attachment: UnknownType) => attachment is LocalAttachment<StreamChatGenerics>;
export declare const isScrapedContent: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(attachment: Attachment<StreamChatGenerics>) => string | undefined;
export declare const isUploadedImage: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(attachment: Attachment<StreamChatGenerics>) => boolean;
export declare const isLocalImageAttachment: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(attachment: Attachment<StreamChatGenerics> | LocalAttachment<StreamChatGenerics>) => attachment is LocalImageAttachment<StreamChatGenerics>;
export declare const isGalleryAttachmentType: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(output: Attachment<StreamChatGenerics> | GalleryAttachment<StreamChatGenerics>) => output is GalleryAttachment<StreamChatGenerics>;
export declare const isAudioAttachment: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(attachment: Attachment<StreamChatGenerics> | LocalAttachment<StreamChatGenerics>) => boolean;
export declare const isLocalAudioAttachment: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(attachment: Attachment<StreamChatGenerics> | LocalAttachment<StreamChatGenerics>) => attachment is LocalAudioAttachment<StreamChatGenerics>;
export declare const isVoiceRecordingAttachment: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(attachment: Attachment<StreamChatGenerics> | LocalAttachment<StreamChatGenerics>) => attachment is VoiceRecordingAttachment;
export declare const isLocalVoiceRecordingAttachment: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(attachment: Attachment<StreamChatGenerics> | LocalAttachment<StreamChatGenerics>) => attachment is LocalVoiceRecordingAttachment<StreamChatGenerics>;
export declare const isFileAttachment: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(attachment: Attachment<StreamChatGenerics> | LocalAttachment<StreamChatGenerics>) => boolean;
export declare const isLocalFileAttachment: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(attachment: Attachment<StreamChatGenerics> | LocalAttachment<StreamChatGenerics>) => attachment is LocalFileAttachment<StreamChatGenerics>;
export declare const isMediaAttachment: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(attachment: Attachment<StreamChatGenerics> | LocalAttachment<StreamChatGenerics>) => boolean;
export declare const isLocalMediaAttachment: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(attachment: Attachment<StreamChatGenerics> | LocalAttachment<StreamChatGenerics>) => attachment is LocalVideoAttachment<StreamChatGenerics>;
export declare const isSvgAttachment: (attachment: Attachment) => boolean;
export declare const divMod: (num: number, divisor: number) => number[];
export declare const displayDuration: (totalSeconds?: number) => string;
