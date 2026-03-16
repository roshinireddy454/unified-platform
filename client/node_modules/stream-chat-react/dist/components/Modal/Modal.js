import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';
import { FocusScope } from '@react-aria/focus';
import { CloseIconRound } from './icons';
import { useTranslationContext } from '../../context';
export const Modal = ({ children, className, onClose, open, }) => {
    const { t } = useTranslationContext('Modal');
    const innerRef = useRef(null);
    const closeRef = useRef(null);
    const handleClick = (event) => {
        const target = event.target;
        if (!innerRef.current || !closeRef.current)
            return;
        if (!innerRef.current.contains(target) || closeRef.current.contains(target))
            onClose?.(event);
    };
    useEffect(() => {
        if (!open)
            return;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape')
                onClose?.(event);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose, open]);
    if (!open)
        return null;
    return (React.createElement("div", { className: clsx('str-chat__modal str-chat__modal--open', className), onClick: handleClick },
        React.createElement(FocusScope, { autoFocus: true, contain: true },
            React.createElement("button", { className: 'str-chat__modal__close-button', ref: closeRef, title: t('Close') },
                React.createElement(CloseIconRound, null)),
            React.createElement("div", { className: 'str-chat__modal__inner str-chat-react__modal__inner', ref: innerRef }, children))));
};
