import { ReactionResponse, ReactionSort } from 'stream-chat';
import { MessageContextValue } from '../../../context';
import { DefaultStreamChatGenerics } from '../../../types/types';
import { ReactionType } from '../types';
export interface FetchReactionsOptions<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> {
    reactionType: ReactionType<StreamChatGenerics>;
    shouldFetch: boolean;
    handleFetchReactions?: MessageContextValue<StreamChatGenerics>['handleFetchReactions'];
    sort?: ReactionSort<StreamChatGenerics>;
}
export declare function useFetchReactions<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(options: FetchReactionsOptions<StreamChatGenerics>): {
    isLoading: boolean;
    reactions: ReactionResponse<StreamChatGenerics>[];
};
