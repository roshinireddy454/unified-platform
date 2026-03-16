import React from 'react';
import { Modal } from '../Modal';
import { MessageBounceProvider } from '../../context';
export function MessageBounceModal({ MessageBouncePrompt, ...modalProps }) {
    return (React.createElement(Modal, { className: 'str-chat__message-bounce-modal', ...modalProps },
        React.createElement(MessageBounceProvider, null,
            React.createElement(MessageBouncePrompt, { onClose: modalProps.onClose }))));
}
