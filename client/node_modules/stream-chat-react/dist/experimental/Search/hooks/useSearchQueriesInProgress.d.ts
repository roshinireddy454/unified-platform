import type { SearchController } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../types';
export type UseSearchQueriesInProgressParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    searchController: SearchController<StreamChatGenerics>;
};
export declare const useSearchQueriesInProgress: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(searchController: SearchController<StreamChatGenerics>) => string[];
