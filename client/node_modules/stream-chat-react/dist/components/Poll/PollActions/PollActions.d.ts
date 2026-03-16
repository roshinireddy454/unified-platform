import React from 'react';
import { AddCommentFormProps } from './AddCommentForm';
import { SuggestPollOptionFormProps } from './SuggestPollOptionForm';
import { EndPollDialogProps } from './EndPollDialog';
import { PollAnswerListProps } from './PollAnswerList';
import { FullPollOptionsListingProps } from './PollOptionsFullList';
import { PollResultsProps } from './PollResults';
import type { DefaultStreamChatGenerics } from '../../../types';
export type PollActionsProps = {
    AddCommentForm?: React.ComponentType<AddCommentFormProps>;
    EndPollDialog?: React.ComponentType<EndPollDialogProps>;
    PollAnswerList?: React.ComponentType<PollAnswerListProps>;
    PollOptionsFullList?: React.ComponentType<FullPollOptionsListingProps>;
    PollResults?: React.ComponentType<PollResultsProps>;
    SuggestPollOptionForm?: React.ComponentType<SuggestPollOptionFormProps>;
};
export declare const PollActions: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ AddCommentForm, EndPollDialog, PollAnswerList, PollOptionsFullList, PollResults, SuggestPollOptionForm, }: PollActionsProps) => React.JSX.Element;
