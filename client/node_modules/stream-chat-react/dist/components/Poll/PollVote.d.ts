import React from 'react';
import type { PollVote as PollVoteType } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../types';
type PollVoteProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    vote: PollVoteType<StreamChatGenerics>;
};
export declare const PollVote: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ vote, }: PollVoteProps<StreamChatGenerics>) => React.JSX.Element;
export type PollVoteListingProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    votes: PollVoteType<StreamChatGenerics>[];
};
export declare const PollVoteListing: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ votes, }: PollVoteListingProps<StreamChatGenerics>) => React.JSX.Element;
export {};
