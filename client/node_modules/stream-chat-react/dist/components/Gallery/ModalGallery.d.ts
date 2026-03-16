import React from 'react';
import type { Attachment } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type ModalGalleryProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    /** The images for the Carousel component */
    images: Attachment<StreamChatGenerics>[];
    /** The index for the component */
    index?: number;
};
export declare const ModalGallery: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: ModalGalleryProps<StreamChatGenerics>) => React.JSX.Element;
