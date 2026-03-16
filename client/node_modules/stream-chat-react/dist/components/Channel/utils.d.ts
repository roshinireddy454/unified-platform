/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { Dispatch, SetStateAction } from 'react';
import type { ChannelState, MessageResponse } from 'stream-chat';
import type { ChannelNotifications } from '../../context/ChannelStateContext';
import type { DefaultStreamChatGenerics } from '../../types';
export declare const makeAddNotifications: (setNotifications: Dispatch<SetStateAction<ChannelNotifications>>, notificationTimeouts: NodeJS.Timeout[]) => (text: string, type: 'success' | 'error') => void;
/**
 * Utility function for jumpToFirstUnreadMessage
 * @param targetId
 * @param msgSet
 */
export declare const findInMsgSetById: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(targetId: string, msgSet: ReturnType<ChannelState<StreamChatGenerics>['formatMessage']>[]) => {
    index: number;
    target: import("stream-chat").FormatMessageResponse<StreamChatGenerics>;
} | {
    index: number;
    target?: undefined;
};
/**
 * Utility function for jumpToFirstUnreadMessage
 * @param targetDate
 * @param msgSet
 * @param exact
 */
export declare const findInMsgSetByDate: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(targetDate: Date, msgSet: MessageResponse<StreamChatGenerics>[] | ReturnType<ChannelState<StreamChatGenerics>['formatMessage']>[], exact?: boolean) => {
    index: number;
    target: MessageResponse<StreamChatGenerics> | import("stream-chat").FormatMessageResponse<StreamChatGenerics>;
} | {
    index: number;
    target?: undefined;
};
