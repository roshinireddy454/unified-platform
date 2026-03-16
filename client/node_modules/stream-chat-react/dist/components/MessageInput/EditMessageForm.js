import React, { useEffect } from 'react';
import { MessageInputFlat } from './MessageInputFlat';
import { useMessageInputContext, useTranslationContext } from '../../context';
export const EditMessageForm = () => {
    const { t } = useTranslationContext('EditMessageForm');
    const { clearEditingState, handleSubmit } = useMessageInputContext('EditMessageForm');
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                clearEditingState?.();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [clearEditingState]);
    return (React.createElement("form", { autoComplete: 'off', className: 'str-chat__edit-message-form', onSubmit: handleSubmit },
        React.createElement(MessageInputFlat, null),
        React.createElement("div", { className: 'str-chat__edit-message-form-options' },
            React.createElement("button", { className: 'str-chat__edit-message-cancel', "data-testid": 'cancel-button', onClick: clearEditingState }, t('Cancel')),
            React.createElement("button", { className: 'str-chat__edit-message-send', "data-testid": 'send-button-edit-form', type: 'submit' }, t('Send')))));
};
