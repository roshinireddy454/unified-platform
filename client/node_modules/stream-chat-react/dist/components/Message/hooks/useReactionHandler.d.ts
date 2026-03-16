import React from 'react';
import { StreamMessage } from '../../../context/ChannelStateContext';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export declare const reactionHandlerWarning = "Reaction handler was called, but it is missing one of its required arguments.\nMake sure the ChannelAction and ChannelState contexts are properly set and the hook is initialized with a valid message.";
export declare const useReactionHandler: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(message?: StreamMessage<StreamChatGenerics>) => (reactionType: string, event?: React.BaseSyntheticEvent) => Promise<void>;
