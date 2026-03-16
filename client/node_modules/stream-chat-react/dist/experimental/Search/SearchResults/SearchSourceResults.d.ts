import React from 'react';
import type { SearchSource } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../types';
export type SearchSourceResultsProps = {
    searchSource: SearchSource;
};
export declare const SearchSourceResults: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ searchSource, }: SearchSourceResultsProps) => React.JSX.Element | null;
