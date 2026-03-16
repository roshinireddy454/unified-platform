import React from 'react';
import type { PollOption } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../../types';
export type PollOptionVotesListingProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    option: PollOption<StreamChatGenerics>;
};
export declare const PollOptionVotesList: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ option, }: PollOptionVotesListingProps<StreamChatGenerics>) => React.JSX.Element;
