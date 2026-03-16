import React from 'react';
import type { DefaultStreamChatGenerics } from '../../types';
export declare const SimpleAttachmentSelector: () => React.JSX.Element;
export type AttachmentSelectorModalContentProps = {
    close: () => void;
};
export type AttachmentSelectorActionProps = {
    closeMenu: () => void;
    openModalForAction: (actionType: AttachmentSelectorAction['type']) => void;
};
export type AttachmentSelectorAction = {
    ActionButton: React.ComponentType<AttachmentSelectorActionProps>;
    type: 'uploadFile' | 'createPoll' | (string & {});
    ModalContent?: React.ComponentType<AttachmentSelectorModalContentProps>;
};
export declare const DefaultAttachmentSelectorComponents: {
    File({ closeMenu }: AttachmentSelectorActionProps): React.JSX.Element;
    Poll({ closeMenu, openModalForAction }: AttachmentSelectorActionProps): React.JSX.Element;
};
export declare const defaultAttachmentSelectorActionSet: AttachmentSelectorAction[];
export type AttachmentSelectorProps = {
    attachmentSelectorActionSet?: AttachmentSelectorAction[];
    getModalPortalDestination?: () => HTMLElement | null;
};
export declare const AttachmentSelector: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ attachmentSelectorActionSet, getModalPortalDestination, }: AttachmentSelectorProps) => React.JSX.Element | null;
