import React from 'react';
import type { DefaultStreamChatGenerics } from '../../../types';
export type FullPollOptionsListingProps = {
    close?: () => void;
};
export declare const PollOptionsFullList: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ close, }: FullPollOptionsListingProps) => React.JSX.Element;
