import React from 'react';
import type { PropsWithChildren } from 'react';
import type { DefaultStreamChatGenerics } from '../../types/types';
import type { ModalProps } from '../Modal';
export type MessageBouncePromptProps = PropsWithChildren<Pick<ModalProps, 'onClose'>>;
export declare function MessageBouncePrompt<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ children, onClose }: MessageBouncePromptProps): React.JSX.Element;
