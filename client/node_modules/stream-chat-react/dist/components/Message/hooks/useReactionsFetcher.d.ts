import { StreamMessage } from '../../../context';
import { DefaultStreamChatGenerics } from '../../../types/types';
import { ReactionResponse, ReactionSort } from 'stream-chat';
import { ReactionType } from '../../Reactions/types';
export declare const MAX_MESSAGE_REACTIONS_TO_FETCH = 1000;
type FetchMessageReactionsNotifications<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    getErrorNotification?: (message: StreamMessage<StreamChatGenerics>) => string;
    notify?: (notificationText: string, type: 'success' | 'error') => void;
};
export declare function useReactionsFetcher<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(message: StreamMessage<StreamChatGenerics>, notifications?: FetchMessageReactionsNotifications<StreamChatGenerics>): (reactionType?: ReactionType<StreamChatGenerics>, sort?: ReactionSort<StreamChatGenerics>) => Promise<ReactionResponse<DefaultStreamChatGenerics>[]>;
export {};
