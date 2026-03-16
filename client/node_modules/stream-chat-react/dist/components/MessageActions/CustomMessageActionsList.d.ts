import React from 'react';
import { CustomMessageActions } from '../../context/MessageContext';
import type { StreamMessage } from '../../context/ChannelStateContext';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type CustomMessageActionsListProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    message: StreamMessage<StreamChatGenerics>;
    customMessageActions?: CustomMessageActions<StreamChatGenerics>;
};
export declare const CustomMessageActionsList: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: CustomMessageActionsListProps<StreamChatGenerics>) => React.JSX.Element | null;
