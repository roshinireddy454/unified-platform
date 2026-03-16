import React from 'react';
import { Modal } from '../../Modal';
export const PollAction = ({ buttonText, children, closeModal, modalClassName, modalIsOpen, openModal, }) => (React.createElement(React.Fragment, null,
    React.createElement("button", { className: 'str-chat__poll-action', onClick: openModal }, buttonText),
    React.createElement(Modal, { className: modalClassName, onClose: closeModal, open: modalIsOpen }, children)));
