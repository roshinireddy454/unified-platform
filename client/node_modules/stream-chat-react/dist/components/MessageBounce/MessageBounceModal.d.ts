import React, { ComponentType, PropsWithChildren } from 'react';
import { ModalProps } from '../Modal';
import { MessageBouncePromptProps } from './MessageBouncePrompt';
export type MessageBounceModalProps = PropsWithChildren<ModalProps & {
    MessageBouncePrompt: ComponentType<MessageBouncePromptProps>;
}>;
export declare function MessageBounceModal({ MessageBouncePrompt, ...modalProps }: MessageBounceModalProps): React.JSX.Element;
