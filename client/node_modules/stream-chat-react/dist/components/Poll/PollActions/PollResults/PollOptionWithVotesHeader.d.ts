import React from 'react';
import type { PollOption } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../../types';
export type PollResultOptionVoteCounterProps = {
    optionId: string;
};
export declare const PollResultOptionVoteCounter: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ optionId, }: PollResultOptionVoteCounterProps) => React.JSX.Element;
export type PollOptionWithVotesHeaderProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    option: PollOption<StreamChatGenerics>;
};
export declare const PollOptionWithVotesHeader: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ option, }: PollOptionWithVotesHeaderProps<StreamChatGenerics>) => React.JSX.Element;
