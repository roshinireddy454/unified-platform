import type { PollAnswer, PollAnswersQueryParams } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../types';
type UsePollAnswerPaginationParams = {
    paginationParams?: PollAnswersQueryParams;
};
export declare const usePollAnswerPagination: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ paginationParams }?: UsePollAnswerPaginationParams) => {
    answers: PollAnswer<StreamChatGenerics>[];
    error: Error | undefined;
    hasNextPage: boolean;
    loading: boolean;
    loadMore: () => Promise<void>;
};
export {};
