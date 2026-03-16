import React from 'react';
import type { DefaultStreamChatGenerics } from '../../types';
export type SearchProps = {
    directMessagingChannelType?: string;
    /** Sets the input element into disabled state */
    disabled?: boolean;
    /** Clear search state / results on every click outside the search input, defaults to false */
    exitSearchOnInputBlur?: boolean;
    /** Custom placeholder text to be displayed in the search input */
    placeholder?: string;
};
export declare const Search: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ directMessagingChannelType, disabled, exitSearchOnInputBlur, placeholder, }: SearchProps) => React.JSX.Element;
