import React from 'react';
import type { PollOption } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../types';
type AmountBarProps = {
    amount: number;
    className?: string;
};
export declare const AmountBar: ({ amount, className }: AmountBarProps) => React.JSX.Element;
export type CheckmarkProps = {
    checked?: boolean;
};
export declare const Checkmark: ({ checked }: CheckmarkProps) => React.JSX.Element;
export type PollOptionSelectorProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    option: PollOption<StreamChatGenerics>;
    displayAvatarCount?: number;
    voteCountVerbose?: boolean;
};
export declare const PollOptionSelector: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ displayAvatarCount, option, voteCountVerbose, }: PollOptionSelectorProps<StreamChatGenerics>) => React.JSX.Element;
export {};
