import React from 'react';
import type { MessageContextValue } from '../../context/MessageContext';
export type QuotedMessageProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Pick<MessageContextValue<StreamChatGenerics>, 'renderText'>;
import type { DefaultStreamChatGenerics } from '../../types/types';
export declare const QuotedMessage: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ renderText: propsRenderText, }: QuotedMessageProps) => React.JSX.Element | null;
