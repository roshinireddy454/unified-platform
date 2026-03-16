import clsx from 'clsx';
import { nanoid } from 'nanoid';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { useHandleFileChangeWrapper } from './utils';
import { useChannelStateContext, useMessageInputContext, useTranslationContext, } from '../../context';
/**
 * @deprecated Use FileInput instead
 */
export const UploadButton = forwardRef(function UploadButton({ onFileChange, resetOnChange = true, ...rest }, ref) {
    const handleInputChange = useHandleFileChangeWrapper(resetOnChange, onFileChange);
    return React.createElement("input", { onChange: handleInputChange, ref: ref, type: 'file', ...rest });
});
export const FileInput = UploadButton;
export const UploadFileInput = forwardRef(function UploadFileInput({ className, onFileChange: onFileChangeCustom, ...props }, ref) {
    const { t } = useTranslationContext('UploadFileInput');
    const { acceptedFiles = [], multipleUploads } = useChannelStateContext('UploadFileInput');
    const { isUploadEnabled, maxFilesLeft, uploadNewFiles } = useMessageInputContext('UploadFileInput');
    const id = useMemo(() => nanoid(), []);
    const onFileChange = useCallback((files) => {
        uploadNewFiles(files);
        onFileChangeCustom?.(files);
    }, [onFileChangeCustom, uploadNewFiles]);
    return (React.createElement(FileInput, { accept: acceptedFiles?.join(','), "aria-label": t('aria/File upload'), "data-testid": 'file-input', disabled: !isUploadEnabled || maxFilesLeft === 0, id: id, multiple: multipleUploads, ...props, className: clsx('str-chat__file-input', className), onFileChange: onFileChange, ref: ref }));
});
