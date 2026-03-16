import type { DefaultStreamChatGenerics } from '../../../types';
import type { PollOptionVotesQueryParams, PollVote } from 'stream-chat';
type UsePollOptionVotesPaginationParams = {
    paginationParams: PollOptionVotesQueryParams;
};
export declare const usePollOptionVotesPagination: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ paginationParams, }: UsePollOptionVotesPaginationParams) => {
    error: Error | undefined;
    hasNextPage: boolean;
    loading: boolean;
    loadMore: () => Promise<void>;
    votes: PollVote<StreamChatGenerics>[];
};
export {};
