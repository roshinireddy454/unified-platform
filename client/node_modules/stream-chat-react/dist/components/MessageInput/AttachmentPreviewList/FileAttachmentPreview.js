import React from 'react';
import { FileIcon } from '../../ReactFileUtilities';
import { CloseIcon, DownloadIcon, LoadingIndicatorIcon, RetryIcon } from '../icons';
import { useTranslationContext } from '../../../context';
export const FileAttachmentPreview = ({ attachment, handleRetry, removeAttachments, }) => {
    const { t } = useTranslationContext('FilePreview');
    return (React.createElement("div", { className: 'str-chat__attachment-preview-file', "data-testid": 'attachment-preview-file' },
        React.createElement("div", { className: 'str-chat__attachment-preview-file-icon' },
            React.createElement(FileIcon, { filename: attachment.title, mimeType: attachment.mime_type })),
        React.createElement("button", { "aria-label": t('aria/Remove attachment'), className: 'str-chat__attachment-preview-delete', "data-testid": 'file-preview-item-delete-button', disabled: attachment.localMetadata?.uploadState === 'uploading', onClick: () => attachment.localMetadata?.id &&
                removeAttachments([attachment.localMetadata?.id]) },
            React.createElement(CloseIcon, null)),
        attachment.localMetadata?.uploadState === 'failed' && !!handleRetry && (React.createElement("button", { className: 'str-chat__attachment-preview-error str-chat__attachment-preview-error-file', "data-testid": 'file-preview-item-retry-button', onClick: () => handleRetry(attachment) },
            React.createElement(RetryIcon, null))),
        React.createElement("div", { className: 'str-chat__attachment-preview-file-end' },
            React.createElement("div", { className: 'str-chat__attachment-preview-file-name', title: attachment.title }, attachment.title),
            attachment.localMetadata?.uploadState === 'finished' &&
                !!attachment.asset_url && (React.createElement("a", { "aria-label": t('aria/Download attachment'), className: 'str-chat__attachment-preview-file-download', download: true, href: attachment.asset_url, rel: 'noreferrer', target: '_blank', title: t('Download attachment {{ name }}', { name: attachment.title }) },
                React.createElement(DownloadIcon, null))),
            attachment.localMetadata?.uploadState === 'uploading' && (React.createElement(LoadingIndicatorIcon, { size: 17 })))));
};
