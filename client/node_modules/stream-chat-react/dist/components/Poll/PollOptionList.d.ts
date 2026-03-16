import React from 'react';
import type { DefaultStreamChatGenerics } from '../../types';
export type PollOptionListProps = {
    optionsDisplayCount?: number;
};
export declare const PollOptionList: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ optionsDisplayCount, }: PollOptionListProps) => React.JSX.Element;
