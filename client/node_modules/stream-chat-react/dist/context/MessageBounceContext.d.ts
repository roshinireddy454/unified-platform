import React, { ReactEventHandler } from 'react';
import { DefaultStreamChatGenerics, PropsWithChildrenOnly } from '../types/types';
import { StreamMessage } from './ChannelStateContext';
export interface MessageBounceContextValue<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> {
    handleDelete: ReactEventHandler;
    handleEdit: ReactEventHandler;
    handleRetry: ReactEventHandler;
    message: StreamMessage<StreamChatGenerics>;
}
export declare function useMessageBounceContext<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(componentName?: string): MessageBounceContextValue<DefaultStreamChatGenerics>;
export declare function MessageBounceProvider<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ children }: PropsWithChildrenOnly): React.JSX.Element;
