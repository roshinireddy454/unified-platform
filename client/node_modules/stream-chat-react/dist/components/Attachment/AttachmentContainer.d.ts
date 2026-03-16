import React, { PropsWithChildren } from 'react';
import { AttachmentComponentType, GalleryAttachment, RenderAttachmentProps, RenderGalleryProps } from './utils';
import type { DefaultStreamChatGenerics } from '../../types/types';
import type { Attachment } from 'stream-chat';
export type AttachmentContainerProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    attachment: Attachment<StreamChatGenerics> | GalleryAttachment<StreamChatGenerics>;
    componentType: AttachmentComponentType;
};
export declare const AttachmentWithinContainer: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ attachment, children, componentType, }: PropsWithChildren<AttachmentContainerProps<StreamChatGenerics>>) => React.JSX.Element;
export declare const AttachmentActionsContainer: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ actionHandler, attachment, AttachmentActions, }: RenderAttachmentProps<StreamChatGenerics>) => React.JSX.Element | null;
export declare const GalleryContainer: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ attachment, Gallery, }: RenderGalleryProps<StreamChatGenerics>) => React.JSX.Element;
export declare const ImageContainer: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: RenderAttachmentProps<StreamChatGenerics>) => React.JSX.Element;
export declare const CardContainer: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: RenderAttachmentProps<StreamChatGenerics>) => React.JSX.Element;
export declare const FileContainer: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ attachment, File, }: RenderAttachmentProps<StreamChatGenerics>) => React.JSX.Element | null;
export declare const AudioContainer: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ attachment, Audio, }: RenderAttachmentProps<StreamChatGenerics>) => React.JSX.Element;
export declare const VoiceRecordingContainer: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ attachment, isQuoted, VoiceRecording, }: RenderAttachmentProps<StreamChatGenerics>) => React.JSX.Element;
export declare const MediaContainer: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: RenderAttachmentProps<StreamChatGenerics>) => React.JSX.Element;
export declare const UnsupportedAttachmentContainer: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ attachment, UnsupportedAttachment, }: RenderAttachmentProps<StreamChatGenerics>) => React.JSX.Element;
