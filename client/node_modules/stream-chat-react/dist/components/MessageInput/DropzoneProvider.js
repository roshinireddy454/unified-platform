import React from 'react';
import { ImageDropzone } from '../ReactFileUtilities';
import { useCooldownTimer } from './hooks/useCooldownTimer';
import { useCreateMessageInputContext } from './hooks/useCreateMessageInputContext';
import { useMessageInputState } from './hooks/useMessageInputState';
import { useChannelStateContext } from '../../context/ChannelStateContext';
import { MessageInputContextProvider, useMessageInputContext, } from '../../context/MessageInputContext';
const DropzoneInner = ({ children, }) => {
    const { acceptedFiles, multipleUploads } = useChannelStateContext('DropzoneProvider');
    const { cooldownRemaining, isUploadEnabled, maxFilesLeft, uploadNewFiles } = useMessageInputContext('DropzoneProvider');
    return (React.createElement(ImageDropzone, { accept: acceptedFiles, disabled: !isUploadEnabled || maxFilesLeft === 0 || !!cooldownRemaining, handleFiles: uploadNewFiles, maxNumberOfFiles: maxFilesLeft, multiple: multipleUploads }, children));
};
export const DropzoneProvider = (props) => {
    const cooldownTimerState = useCooldownTimer();
    const messageInputState = useMessageInputState(props);
    const messageInputContextValue = useCreateMessageInputContext({
        ...cooldownTimerState,
        ...messageInputState,
        ...props,
    });
    return (React.createElement(MessageInputContextProvider, { value: messageInputContextValue },
        React.createElement(DropzoneInner, null, props.children)));
};
