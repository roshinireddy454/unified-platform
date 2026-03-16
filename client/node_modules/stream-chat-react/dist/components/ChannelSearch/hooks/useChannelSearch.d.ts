import React from 'react';
import { ChannelOrUserResponse } from '../utils';
import type { Channel, ChannelFilters, ChannelOptions, ChannelSort, UserFilters, UserOptions, UserSort } from 'stream-chat';
import type { SearchBarController } from '../SearchBar';
import type { SearchInputController } from '../SearchInput';
import type { SearchResultsController } from '../SearchResults';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export type ChannelSearchFunctionParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    setResults: React.Dispatch<React.SetStateAction<ChannelOrUserResponse<StreamChatGenerics>[]>>;
    setSearching: React.Dispatch<React.SetStateAction<boolean>>;
};
export type SearchController<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = SearchInputController & SearchBarController & SearchResultsController<StreamChatGenerics>;
export type SearchQueryParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    channelFilters?: {
        filters?: ChannelFilters<StreamChatGenerics>;
        options?: ChannelOptions;
        sort?: ChannelSort<StreamChatGenerics>;
    };
    userFilters?: {
        filters?: UserFilters<StreamChatGenerics> | ((query: string) => UserFilters<StreamChatGenerics>);
        options?: UserOptions;
        sort?: UserSort<StreamChatGenerics>;
    };
};
export type ChannelSearchParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    /** The type of channel to create on user result select, defaults to `messaging` */
    channelType?: string;
    /** Clear search state / results on every click outside the search input, defaults to true */
    clearSearchOnClickOutside?: boolean;
    /** Disables execution of the search queries, defaults to false */
    disabled?: boolean;
    /** Callback invoked with every search input change handler */
    onSearch?: SearchInputController['onSearch'];
    /** Callback invoked when the search UI is deactivated */
    onSearchExit?: () => void;
    /** Custom handler function to run on search result item selection */
    onSelectResult?: (params: ChannelSearchFunctionParams<StreamChatGenerics>, result: ChannelOrUserResponse<StreamChatGenerics>) => Promise<void> | void;
    /** The number of milliseconds to debounce the search query. The default interval is 200ms. */
    searchDebounceIntervalMs?: number;
    /** Boolean to search for channels in the server query, default is false and just searches for users */
    searchForChannels?: boolean;
    /** Boolean to search for users in the server query, default is true and just searches for users */
    searchForUsers?: boolean;
    /** Custom search function to override the default implementation */
    searchFunction?: (params: ChannelSearchFunctionParams<StreamChatGenerics>, event: React.BaseSyntheticEvent) => Promise<void> | void;
    /** Object containing filters/sort/options overrides for user / channel search */
    searchQueryParams?: SearchQueryParams<StreamChatGenerics>;
};
export type ChannelSearchControllerParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = ChannelSearchParams<StreamChatGenerics> & {
    /** Set the array of channels displayed in the ChannelList */
    setChannels?: React.Dispatch<React.SetStateAction<Array<Channel<StreamChatGenerics>>>>;
};
export declare const useChannelSearch: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ channelType, clearSearchOnClickOutside, disabled, onSearch: onSearchCallback, onSearchExit, onSelectResult, searchDebounceIntervalMs, searchForChannels, searchForUsers, searchFunction, searchQueryParams, setChannels, }: ChannelSearchControllerParams<StreamChatGenerics>) => SearchController<StreamChatGenerics>;
