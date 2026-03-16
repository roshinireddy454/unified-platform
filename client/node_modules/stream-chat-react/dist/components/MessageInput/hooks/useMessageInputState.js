import { useCallback, useReducer, useState } from 'react';
import { nanoid } from 'nanoid';
import { useChannelStateContext, } from '../../../context/ChannelStateContext';
import { useAttachments } from './useAttachments';
import { useLinkPreviews } from './useLinkPreviews';
import { useMessageInputText } from './useMessageInputText';
import { useSubmitHandler } from './useSubmitHandler';
import { usePasteHandler } from './usePasteHandler';
import { useMediaRecorder, } from '../../MediaRecorder/hooks/useMediaRecorder';
import { LinkPreviewState, SetLinkPreviewMode } from '../types';
import { mergeDeep } from '../../../utils/mergeDeep';
const makeEmptyMessageInputState = () => ({
    attachments: [],
    linkPreviews: new Map(),
    mentioned_users: [],
    setText: () => null,
    text: '',
});
/**
 * Initializes the state. Empty if the message prop is falsy.
 */
const initState = (message) => {
    if (!message) {
        return makeEmptyMessageInputState();
    }
    const linkPreviews = message.attachments?.reduce((acc, attachment) => {
        if (!attachment.og_scrape_url)
            return acc;
        acc.set(attachment.og_scrape_url, {
            ...attachment,
            state: LinkPreviewState.LOADED,
        });
        return acc;
    }, new Map()) ?? new Map();
    const attachments = message.attachments
        ?.filter(({ og_scrape_url }) => !og_scrape_url)
        .map((att) => ({
        ...att,
        localMetadata: { id: nanoid() },
    })) || [];
    const mentioned_users = message.mentioned_users || [];
    return {
        attachments,
        linkPreviews,
        mentioned_users,
        setText: () => null,
        text: message.text || '',
    };
};
/**
 * MessageInput state reducer
 */
const messageInputReducer = (state, action) => {
    switch (action.type) {
        case 'setText':
            return { ...state, text: action.getNewText(state.text) };
        case 'clear':
            return makeEmptyMessageInputState();
        case 'upsertAttachments': {
            const attachments = [...state.attachments];
            action.attachments.forEach((actionAttachment) => {
                const attachmentIndex = state.attachments.findIndex((att) => att.localMetadata?.id &&
                    att.localMetadata?.id === actionAttachment.localMetadata?.id);
                if (attachmentIndex === -1) {
                    attachments.push(actionAttachment);
                }
                else {
                    const upsertedAttachment = mergeDeep(state.attachments[attachmentIndex] ?? {}, actionAttachment);
                    attachments.splice(attachmentIndex, 1, upsertedAttachment);
                }
            });
            return {
                ...state,
                attachments,
            };
        }
        case 'removeAttachments': {
            return {
                ...state,
                attachments: state.attachments.filter((att) => !action.ids.includes(att.localMetadata?.id)),
            };
        }
        case 'setLinkPreviews': {
            const linkPreviews = new Map(state.linkPreviews);
            if (action.mode === SetLinkPreviewMode.REMOVE) {
                Array.from(action.linkPreviews.keys()).forEach((key) => {
                    linkPreviews.delete(key);
                });
            }
            else {
                Array.from(action.linkPreviews.values()).reduce((acc, linkPreview) => {
                    const existingPreview = acc.get(linkPreview.og_scrape_url);
                    const alreadyEnqueued = linkPreview.state === LinkPreviewState.QUEUED &&
                        existingPreview?.state !== LinkPreviewState.FAILED;
                    if (existingPreview && alreadyEnqueued)
                        return acc;
                    acc.set(linkPreview.og_scrape_url, linkPreview);
                    return acc;
                }, linkPreviews);
                if (action.mode === SetLinkPreviewMode.SET) {
                    Array.from(state.linkPreviews.keys()).forEach((key) => {
                        if (!action.linkPreviews.get(key))
                            linkPreviews.delete(key);
                    });
                }
            }
            return {
                ...state,
                linkPreviews,
            };
        }
        case 'addMentionedUser':
            return {
                ...state,
                mentioned_users: state.mentioned_users.concat(action.user),
            };
        default:
            return state;
    }
};
/**
 * hook for MessageInput state
 */
export const useMessageInputState = (props) => {
    const { additionalTextareaProps, asyncMessagesMultiSendEnabled, audioRecordingConfig, audioRecordingEnabled, getDefaultValue, message, urlEnrichmentConfig, } = props;
    const { channelCapabilities = {}, enrichURLForPreview: enrichURLForPreviewChannelContext, } = useChannelStateContext('useMessageInputState');
    const defaultValue = getDefaultValue?.() || additionalTextareaProps?.defaultValue;
    const initialStateValue = message ||
        (Array.isArray(defaultValue)
            ? { text: defaultValue.join('') }
            : { text: defaultValue?.toString() });
    const [state, dispatch] = useReducer(messageInputReducer, initialStateValue, initState);
    const enrichURLsController = useLinkPreviews({
        dispatch,
        linkPreviews: state.linkPreviews,
        ...urlEnrichmentConfig,
        enrichURLForPreview: urlEnrichmentConfig?.enrichURLForPreview ?? enrichURLForPreviewChannelContext,
    });
    const { handleChange, insertText, textareaRef } = useMessageInputText(props, state, dispatch, enrichURLsController.findAndEnqueueURLsToEnrich);
    const [showCommandsList, setShowCommandsList] = useState(false);
    const [showMentionsList, setShowMentionsList] = useState(false);
    const openCommandsList = () => {
        dispatch({
            getNewText: () => '/',
            type: 'setText',
        });
        setShowCommandsList(true);
    };
    const closeCommandsList = () => setShowCommandsList(false);
    const openMentionsList = () => {
        dispatch({
            getNewText: (currentText) => currentText + '@',
            type: 'setText',
        });
        setShowMentionsList(true);
    };
    const closeMentionsList = () => setShowMentionsList(false);
    const { maxFilesLeft, numberOfUploads, removeAttachments, uploadAttachment, uploadNewFiles, upsertAttachments, } = useAttachments(props, state, dispatch, textareaRef);
    const { handleSubmit } = useSubmitHandler(props, state, dispatch, numberOfUploads, enrichURLsController);
    const recordingController = useMediaRecorder({
        asyncMessagesMultiSendEnabled,
        enabled: !!audioRecordingEnabled,
        handleSubmit,
        recordingConfig: audioRecordingConfig,
        uploadAttachment,
    });
    const isUploadEnabled = !!channelCapabilities['upload-file'];
    const { onPaste } = usePasteHandler(uploadNewFiles, insertText, isUploadEnabled, enrichURLsController.findAndEnqueueURLsToEnrich);
    const onSelectUser = useCallback((item) => {
        dispatch({ type: 'addMentionedUser', user: item });
    }, []);
    const setText = useCallback((text) => {
        dispatch({ getNewText: () => text, type: 'setText' });
    }, []);
    return {
        ...state,
        ...enrichURLsController,
        closeCommandsList,
        closeMentionsList,
        handleChange,
        handleSubmit,
        insertText,
        isUploadEnabled,
        maxFilesLeft,
        numberOfUploads,
        onPaste,
        onSelectUser,
        openCommandsList,
        openMentionsList,
        recordingController,
        removeAttachments,
        setText,
        showCommandsList,
        showMentionsList,
        textareaRef,
        uploadAttachment,
        uploadNewFiles,
        upsertAttachments,
    };
};
