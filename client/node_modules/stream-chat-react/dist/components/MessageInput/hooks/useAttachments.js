import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { checkUploadPermissions } from './utils';
import { isLocalAttachment, isLocalImageAttachment } from '../../Attachment';
import { createFileFromBlobs, generateFileName, isBlobButNotFile, } from '../../ReactFileUtilities';
import { useChannelActionContext, useChannelStateContext, useChatContext, useTranslationContext, } from '../../../context';
const apiMaxNumberOfFiles = 10;
// const isAudioFile = (file: FileLike) => file.type.includes('audio/');
const isImageFile = (file) => file.type.startsWith('image/') && !file.type.endsWith('.photoshop'); // photoshop files begin with 'image/'
// const isVideoFile = (file: FileLike) => file.type.includes('video/');
const getAttachmentTypeFromMime = (mimeType) => {
    if (mimeType.startsWith('image/') && !mimeType.endsWith('.photoshop'))
        return 'image';
    if (mimeType.includes('video/'))
        return 'video';
    if (mimeType.includes('audio/'))
        return 'audio';
    return 'file';
};
const ensureIsLocalAttachment = (attachment) => {
    if (isLocalAttachment(attachment)) {
        return attachment;
    }
    const { localMetadata, ...rest } = attachment;
    return {
        localMetadata: {
            ...(localMetadata ?? {}),
            id: localMetadata?.id || nanoid(),
        },
        ...rest,
    };
};
export const useAttachments = (props, state, dispatch, textareaRef) => {
    const { doFileUploadRequest, doImageUploadRequest, errorHandler, noFiles } = props;
    const { getAppSettings } = useChatContext('useAttachments');
    const { t } = useTranslationContext('useAttachments');
    const { addNotification } = useChannelActionContext('useAttachments');
    const { channel, maxNumberOfFiles, multipleUploads } = useChannelStateContext('useAttachments');
    // Number of files that the user can still add. Should never be more than the amount allowed by the API.
    // If multipleUploads is false, we only want to allow a single upload.
    const maxFilesAllowed = !multipleUploads ? 1 : maxNumberOfFiles || apiMaxNumberOfFiles;
    const numberOfUploads = Object.values(state.attachments).filter(({ localMetadata }) => localMetadata.uploadState && localMetadata.uploadState !== 'failed').length;
    const maxFilesLeft = maxFilesAllowed - numberOfUploads;
    const removeAttachments = useCallback((ids) => {
        if (!ids.length)
            return;
        dispatch({ ids, type: 'removeAttachments' });
    }, [dispatch]);
    const upsertAttachments = useCallback((attachments) => {
        if (!attachments.length)
            return;
        dispatch({
            attachments: attachments.map(ensureIsLocalAttachment),
            type: 'upsertAttachments',
        });
    }, [dispatch]);
    const uploadAttachment = useCallback(async (att) => {
        const { localMetadata, ...providedAttachmentData } = att;
        if (!localMetadata?.file)
            return att;
        const { file } = localMetadata;
        const isImage = isImageFile(file);
        if (noFiles && !isImage)
            return att;
        const canUpload = await checkUploadPermissions({
            addNotification,
            file,
            getAppSettings,
            t,
            uploadType: isImage ? 'image' : 'file',
        });
        if (!canUpload)
            return att;
        localMetadata.id = localMetadata?.id ?? nanoid();
        const finalAttachment = {
            type: getAttachmentTypeFromMime(file.type),
        };
        if (isImage) {
            localMetadata.previewUri = URL.createObjectURL?.(file);
            if (file instanceof File) {
                finalAttachment.fallback = file.name;
            }
        }
        else {
            finalAttachment.file_size = file.size;
            finalAttachment.mime_type = file.type;
            if (file instanceof File) {
                finalAttachment.title = file.name;
            }
        }
        Object.assign(finalAttachment, providedAttachmentData);
        upsertAttachments([
            {
                ...finalAttachment,
                localMetadata: {
                    ...localMetadata,
                    uploadState: 'uploading',
                },
            },
        ]);
        let response;
        try {
            const doUploadRequest = isImage ? doImageUploadRequest : doFileUploadRequest;
            if (doUploadRequest) {
                response = await doUploadRequest(file, channel);
            }
            else {
                response = await channel[isImage ? 'sendImage' : 'sendFile'](file);
            }
        }
        catch (error) {
            let finalError = {
                message: t('Error uploading attachment'),
                name: 'Error',
            };
            if (typeof error.message === 'string') {
                finalError = error;
            }
            else if (typeof error === 'object') {
                finalError = Object.assign(finalError, error);
            }
            console.error(finalError);
            addNotification(finalError.message, 'error');
            const failedAttachment = {
                ...finalAttachment,
                localMetadata: {
                    ...localMetadata,
                    uploadState: 'failed',
                },
            };
            upsertAttachments([failedAttachment]);
            if (errorHandler) {
                errorHandler(finalError, 'upload-attachment', {
                    ...file,
                    id: localMetadata.id,
                });
            }
            return failedAttachment;
        }
        if (!response) {
            // Copied this from useImageUpload / useFileUpload.
            // If doUploadRequest returns any falsy value, then don't create the upload preview.
            // This is for the case if someone wants to handle failure on app level.
            removeAttachments([localMetadata.id]);
            return;
        }
        const uploadedAttachment = {
            ...finalAttachment,
            localMetadata: {
                ...localMetadata,
                uploadState: 'finished',
            },
        };
        if (isLocalImageAttachment(uploadedAttachment)) {
            if (uploadedAttachment.localMetadata.previewUri) {
                URL.revokeObjectURL(uploadedAttachment.localMetadata.previewUri);
                delete uploadedAttachment.localMetadata.previewUri;
            }
            uploadedAttachment.image_url = response.file;
        }
        else {
            uploadedAttachment.asset_url = response.file;
        }
        if (response.thumb_url) {
            uploadedAttachment.thumb_url = response.thumb_url;
        }
        upsertAttachments([uploadedAttachment]);
        return uploadedAttachment;
    }, [
        addNotification,
        channel,
        doFileUploadRequest,
        doImageUploadRequest,
        errorHandler,
        getAppSettings,
        noFiles,
        removeAttachments,
        t,
        upsertAttachments,
    ]);
    const uploadNewFiles = useCallback((files) => {
        const filesToBeUploaded = noFiles
            ? Array.from(files).filter(isImageFile)
            : Array.from(files);
        filesToBeUploaded.slice(0, maxFilesLeft).forEach((fileLike) => {
            uploadAttachment({
                localMetadata: {
                    file: isBlobButNotFile(fileLike)
                        ? createFileFromBlobs({
                            blobsArray: [fileLike],
                            fileName: generateFileName(fileLike.type),
                            mimeType: fileLike.type,
                        })
                        : fileLike,
                    id: nanoid(),
                },
            });
        });
        textareaRef.current?.focus();
    }, [maxFilesLeft, noFiles, textareaRef, uploadAttachment]);
    return {
        maxFilesLeft,
        numberOfUploads,
        removeAttachments,
        uploadAttachment,
        uploadNewFiles,
        upsertAttachments,
    };
};
