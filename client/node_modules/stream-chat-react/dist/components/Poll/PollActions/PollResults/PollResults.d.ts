import React from 'react';
import type { DefaultStreamChatGenerics } from '../../../../types';
export type PollResultsProps = {
    close?: () => void;
};
export declare const PollResults: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ close, }: PollResultsProps) => React.JSX.Element;
