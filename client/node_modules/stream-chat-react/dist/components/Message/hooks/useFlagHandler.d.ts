import type { ReactEventHandler } from '../types';
import type { StreamMessage } from '../../../context/ChannelStateContext';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export declare const missingUseFlagHandlerParameterWarning = "useFlagHandler was called but it is missing one or more necessary parameters.";
export type FlagMessageNotifications<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    getErrorNotification?: (message: StreamMessage<StreamChatGenerics>) => string;
    getSuccessNotification?: (message: StreamMessage<StreamChatGenerics>) => string;
    notify?: (notificationText: string, type: 'success' | 'error') => void;
};
export declare const useFlagHandler: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(message?: StreamMessage<StreamChatGenerics>, notifications?: FlagMessageNotifications<StreamChatGenerics>) => ReactEventHandler;
