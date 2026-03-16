import type { PollAnswer, PollVote } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../types';
import { CursorPaginatorStateStore } from '../../InfiniteScrollPaginator/hooks/useCursorPaginator';
export declare function useManagePollVotesRealtime<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, T extends PollVote<StreamChatGenerics> | PollAnswer<StreamChatGenerics> = PollVote<StreamChatGenerics>>(managedVoteType: 'answer' | 'vote', cursorPaginatorState?: CursorPaginatorStateStore<T>, optionId?: string): T[];
