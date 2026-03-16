import React from 'react';
import { Message } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type SendButtonProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    sendMessage: (event: React.BaseSyntheticEvent, customMessageData?: Partial<Message<StreamChatGenerics>>) => void;
} & React.ComponentProps<'button'>;
export declare const SendButton: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ sendMessage, ...rest }: SendButtonProps<StreamChatGenerics>) => React.JSX.Element;
