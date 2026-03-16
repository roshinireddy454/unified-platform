import React from 'react';
import { SearchResultItemComponents } from './SearchResultItem';
import type { DefaultStreamChatGenerics } from '../../../types';
export type SearchSourceResultListProps = {
    loadMoreDebounceMs?: number;
    loadMoreThresholdPx?: number;
    SearchResultItems?: SearchResultItemComponents;
};
export declare const SearchSourceResultList: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ loadMoreDebounceMs, loadMoreThresholdPx, SearchResultItems, }: SearchSourceResultListProps) => React.JSX.Element | null;
