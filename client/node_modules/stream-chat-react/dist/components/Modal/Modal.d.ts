import React, { PropsWithChildren } from 'react';
export type ModalProps = {
    /** If true, modal is opened or visible. */
    open: boolean;
    /** Custom class to be applied to the modal root div */
    className?: string;
    /** Callback handler for closing of modal. */
    onClose?: (event: React.KeyboardEvent | React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
};
export declare const Modal: ({ children, className, onClose, open, }: PropsWithChildren<ModalProps>) => React.JSX.Element | null;
