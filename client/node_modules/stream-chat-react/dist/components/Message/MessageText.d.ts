import React from 'react';
import type { MessageContextValue, StreamMessage } from '../../context';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type MessageTextProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    customInnerClass?: string;
    customWrapperClass?: string;
    message?: StreamMessage<StreamChatGenerics>;
    theme?: string;
} & Pick<MessageContextValue<StreamChatGenerics>, 'renderText'>;
export declare const MessageText: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: MessageTextProps<StreamChatGenerics>) => React.JSX.Element | null;
