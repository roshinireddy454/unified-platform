import React, { PropsWithChildren } from 'react';
import type { SearchController } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../types';
export type SearchContextValue<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    /** The type of channel to create on user result select, defaults to `messaging` */
    directMessagingChannelType: string;
    /** Instance of the search controller that handles the data management */
    searchController: SearchController<StreamChatGenerics>;
    /** Sets the input element into disabled state */
    disabled?: boolean;
    /** Clear search state / results on every click outside the search input, defaults to true */
    exitSearchOnInputBlur?: boolean;
    /** Custom placeholder text to be displayed in the search input */
    placeholder?: string;
};
export declare const SearchContext: React.Context<SearchContextValue<DefaultStreamChatGenerics> | undefined>;
/**
 * Context provider for components rendered within the `Search` component
 */
export declare const SearchContextProvider: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ children, value, }: PropsWithChildren<{
    value: SearchContextValue<StreamChatGenerics>;
}>) => React.JSX.Element;
export declare const useSearchContext: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>() => SearchContextValue<StreamChatGenerics>;
