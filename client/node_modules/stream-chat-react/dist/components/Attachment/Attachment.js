import React, { useMemo } from 'react';
import { isAudioAttachment, isFileAttachment, isMediaAttachment, isScrapedContent, isUploadedImage, isVoiceRecordingAttachment, } from './utils';
import { AudioContainer, CardContainer, FileContainer, GalleryContainer, ImageContainer, MediaContainer, UnsupportedAttachmentContainer, VoiceRecordingContainer, } from './AttachmentContainer';
const CONTAINER_MAP = {
    audio: AudioContainer,
    card: CardContainer,
    file: FileContainer,
    media: MediaContainer,
    unsupported: UnsupportedAttachmentContainer,
    voiceRecording: VoiceRecordingContainer,
};
export const ATTACHMENT_GROUPS_ORDER = [
    'card',
    'gallery',
    'image',
    'media',
    'audio',
    'voiceRecording',
    'file',
    'unsupported',
];
/**
 * A component used for rendering message attachments. By default, the component supports: AttachmentActions, Audio, Card, File, Gallery, Image, and Video
 */
export const Attachment = (props) => {
    const { attachments } = props;
    const groupedAttachments = useMemo(() => renderGroupedAttachments(props), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attachments]);
    return (React.createElement("div", { className: 'str-chat__attachment-list' }, ATTACHMENT_GROUPS_ORDER.reduce((acc, groupName) => [...acc, ...groupedAttachments[groupName]], [])));
};
const renderGroupedAttachments = ({ attachments, ...rest }) => {
    const uploadedImages = attachments.filter((attachment) => isUploadedImage(attachment));
    const containers = attachments
        .filter((attachment) => !isUploadedImage(attachment))
        .reduce((typeMap, attachment) => {
        const attachmentType = getAttachmentType(attachment);
        const Container = CONTAINER_MAP[attachmentType];
        typeMap[attachmentType].push(React.createElement(Container, { key: `${attachmentType}-${typeMap[attachmentType].length}`, ...rest, attachment: attachment }));
        return typeMap;
    }, {
        audio: [],
        card: [],
        file: [],
        media: [],
        unsupported: [],
        // not used in reduce
        // eslint-disable-next-line sort-keys
        image: [],
        // eslint-disable-next-line sort-keys
        gallery: [],
        voiceRecording: [],
    });
    if (uploadedImages.length > 1) {
        containers['gallery'] = [
            React.createElement(GalleryContainer, { key: 'gallery-container', ...rest, attachment: {
                    images: uploadedImages,
                    type: 'gallery',
                } }),
        ];
    }
    else if (uploadedImages.length === 1) {
        containers['image'] = [
            React.createElement(ImageContainer, { key: 'image-container', ...rest, attachment: uploadedImages[0] }),
        ];
    }
    return containers;
};
const getAttachmentType = (attachment) => {
    if (isScrapedContent(attachment)) {
        return 'card';
    }
    else if (isMediaAttachment(attachment)) {
        return 'media';
    }
    else if (isAudioAttachment(attachment)) {
        return 'audio';
    }
    else if (isVoiceRecordingAttachment(attachment)) {
        return 'voiceRecording';
    }
    else if (isFileAttachment(attachment)) {
        return 'file';
    }
    return 'unsupported';
};
