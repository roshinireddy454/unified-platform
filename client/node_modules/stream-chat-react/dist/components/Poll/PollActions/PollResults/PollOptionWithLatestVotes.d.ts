import React from 'react';
import type { PollOption } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../../types';
export type PollOptionWithVotesProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    option: PollOption<StreamChatGenerics>;
    countVotesPreview?: number;
    showAllVotes?: () => void;
};
export declare const PollOptionWithLatestVotes: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ countVotesPreview, option, showAllVotes, }: PollOptionWithVotesProps<StreamChatGenerics>) => React.JSX.Element;
