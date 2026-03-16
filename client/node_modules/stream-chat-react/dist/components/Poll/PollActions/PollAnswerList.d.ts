import React from 'react';
import type { DefaultStreamChatGenerics } from '../../../types';
export type PollAnswerListProps = {
    onUpdateOwnAnswerClick: () => void;
    close?: () => void;
};
export declare const PollAnswerList: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ close, onUpdateOwnAnswerClick, }: PollAnswerListProps) => React.JSX.Element;
