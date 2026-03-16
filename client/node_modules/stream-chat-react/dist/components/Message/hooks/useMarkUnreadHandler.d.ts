import type { StreamMessage } from '../../../context';
import type { ReactEventHandler } from '../types';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export type MarkUnreadHandlerNotifications<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    getErrorNotification?: (message: StreamMessage<StreamChatGenerics>) => string;
    getSuccessNotification?: (message: StreamMessage<StreamChatGenerics>) => string;
    notify?: (notificationText: string, type: 'success' | 'error') => void;
};
export declare const useMarkUnreadHandler: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(message?: StreamMessage<StreamChatGenerics>, notifications?: MarkUnreadHandlerNotifications<StreamChatGenerics>) => ReactEventHandler;
