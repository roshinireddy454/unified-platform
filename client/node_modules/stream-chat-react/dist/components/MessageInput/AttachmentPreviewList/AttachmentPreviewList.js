import React from 'react';
import { UnsupportedAttachmentPreview as DefaultUnknownAttachmentPreview, } from './UnsupportedAttachmentPreview';
import { VoiceRecordingPreview as DefaultVoiceRecordingPreview, } from './VoiceRecordingPreview';
import { FileAttachmentPreview as DefaultFilePreview, } from './FileAttachmentPreview';
import { ImageAttachmentPreview as DefaultImagePreview, } from './ImageAttachmentPreview';
import { isLocalAttachment, isLocalAudioAttachment, isLocalFileAttachment, isLocalImageAttachment, isLocalMediaAttachment, isLocalVoiceRecordingAttachment, isScrapedContent, } from '../../Attachment';
import { useMessageInputContext } from '../../../context';
export const AttachmentPreviewList = ({ AudioAttachmentPreview = DefaultFilePreview, FileAttachmentPreview = DefaultFilePreview, ImageAttachmentPreview = DefaultImagePreview, UnsupportedAttachmentPreview = DefaultUnknownAttachmentPreview, VideoAttachmentPreview = DefaultFilePreview, VoiceRecordingPreview = DefaultVoiceRecordingPreview, }) => {
    const { attachments, removeAttachments, uploadAttachment } = useMessageInputContext('AttachmentPreviewList');
    return (React.createElement("div", { className: 'str-chat__attachment-preview-list' },
        React.createElement("div", { className: 'str-chat__attachment-list-scroll-container', "data-testid": 'attachment-list-scroll-container' }, attachments.map((attachment) => {
            if (isScrapedContent(attachment))
                return null;
            if (isLocalVoiceRecordingAttachment(attachment)) {
                return (React.createElement(VoiceRecordingPreview, { attachment: attachment, handleRetry: uploadAttachment, key: attachment.localMetadata.id || attachment.asset_url, removeAttachments: removeAttachments }));
            }
            else if (isLocalAudioAttachment(attachment)) {
                return (React.createElement(AudioAttachmentPreview, { attachment: attachment, handleRetry: uploadAttachment, key: attachment.localMetadata.id || attachment.asset_url, removeAttachments: removeAttachments }));
            }
            else if (isLocalMediaAttachment(attachment)) {
                return (React.createElement(VideoAttachmentPreview, { attachment: attachment, handleRetry: uploadAttachment, key: attachment.localMetadata.id || attachment.asset_url, removeAttachments: removeAttachments }));
            }
            else if (isLocalImageAttachment(attachment)) {
                return (React.createElement(ImageAttachmentPreview, { attachment: attachment, handleRetry: uploadAttachment, key: attachment.localMetadata.id || attachment.image_url, removeAttachments: removeAttachments }));
            }
            else if (isLocalFileAttachment(attachment)) {
                return (React.createElement(FileAttachmentPreview, { attachment: attachment, handleRetry: uploadAttachment, key: attachment.localMetadata.id || attachment.asset_url, removeAttachments: removeAttachments }));
            }
            else if (isLocalAttachment(attachment)) {
                return (React.createElement(UnsupportedAttachmentPreview, { attachment: attachment, handleRetry: uploadAttachment, key: attachment.localMetadata.id, removeAttachments: removeAttachments }));
            }
            return null;
        }))));
};
