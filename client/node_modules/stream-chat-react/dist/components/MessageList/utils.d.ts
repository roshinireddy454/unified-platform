/// <reference types="react" />
import { CUSTOM_MESSAGE_TYPE } from '../../constants/messageTypes';
import type { MessageLabel, UserResponse } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../types/types';
import type { StreamMessage } from '../../context/ChannelStateContext';
type ProcessMessagesContext = {
    /** the connected user ID */
    userId: string;
    /** Enable date separator */
    enableDateSeparator?: boolean;
    /** Enable deleted messages to be filtered out of resulting message list */
    hideDeletedMessages?: boolean;
    /** Disable date separator display for unread incoming messages */
    hideNewMessageSeparator?: boolean;
    /** Sets the threshold after everything is considered unread */
    lastRead?: Date | null;
};
export type ProcessMessagesParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = ProcessMessagesContext & {
    messages: StreamMessage<StreamChatGenerics>[];
    reviewProcessedMessage?: (params: {
        /** array of messages representing the changes applied around a given processed message */
        changes: StreamMessage<StreamChatGenerics>[];
        /** configuration params and information forwarded from `processMessages` */
        context: ProcessMessagesContext;
        /** index of the processed message in the original messages array */
        index: number;
        /** array of messages retrieved from the back-end */
        messages: StreamMessage<StreamChatGenerics>[];
        /** newly built array of messages to be later rendered */
        processedMessages: StreamMessage<StreamChatGenerics>[];
    }) => StreamMessage<StreamChatGenerics>[];
    /** Signals whether to separate giphy preview as well as used to set the giphy preview state */
    setGiphyPreviewMessage?: React.Dispatch<React.SetStateAction<StreamMessage<StreamChatGenerics> | undefined>>;
};
/**
 * processMessages - Transform the input message list according to config parameters
 *
 * Inserts date separators btw. messages created on different dates or before unread incoming messages. By default:
 * - enabled in main message list
 * - disabled in virtualized message list
 * - disabled in thread
 *
 * Allows to filter out deleted messages, contolled by hideDeletedMessages param. This is disabled by default.
 *
 * Sets Giphy preview message for VirtualizedMessageList
 *
 * The only required params are messages and userId, the rest are config params:
 *
 * @return {StreamMessage<StreamChatGenerics>[]} Transformed list of messages
 */
export declare const processMessages: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(params: ProcessMessagesParams<StreamChatGenerics>) => StreamMessage<StreamChatGenerics>[];
export declare const makeDateMessageId: (date?: string | Date) => string;
export declare const getLastReceived: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(messages: StreamMessage<StreamChatGenerics>[]) => string | null;
export declare const getReadStates: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(messages: StreamMessage<StreamChatGenerics>[], read: Record<string, {
    last_read: Date;
    user: UserResponse<StreamChatGenerics>;
}> | undefined, returnAllReadData: boolean) => Record<string, UserResponse<StreamChatGenerics>[]>;
export declare const insertIntro: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(messages: StreamMessage<StreamChatGenerics>[], headerPosition?: number) => StreamMessage<StreamChatGenerics>[];
export type GroupStyle = '' | 'middle' | 'top' | 'bottom' | 'single';
export declare const getGroupStyles: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(message: StreamMessage<StreamChatGenerics>, previousMessage: StreamMessage<StreamChatGenerics>, nextMessage: StreamMessage<StreamChatGenerics>, noGroupByUser: boolean, maxTimeBetweenGroupedMessages?: number) => GroupStyle;
export declare const hasMoreMessagesProbably: (returnedCountMessages: number, limit: number) => boolean;
export declare const hasNotMoreMessages: (returnedCountMessages: number, limit: number) => boolean;
type DateSeparatorMessage = {
    customType: typeof CUSTOM_MESSAGE_TYPE.date;
    date: Date;
    id: string;
    type: MessageLabel;
    unread: boolean;
};
export declare function isDateSeparatorMessage<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(message: StreamMessage<StreamChatGenerics>): message is DateSeparatorMessage;
export declare const getIsFirstUnreadMessage: ({ firstUnreadMessageId, isFirstMessage, lastReadDate, lastReadMessageId, message, previousMessage, unreadMessageCount, }: {
    isFirstMessage: boolean;
    message: StreamMessage;
    firstUnreadMessageId?: string;
    lastReadDate?: Date;
    lastReadMessageId?: string;
    previousMessage?: StreamMessage;
    unreadMessageCount?: number;
}) => boolean;
export {};
