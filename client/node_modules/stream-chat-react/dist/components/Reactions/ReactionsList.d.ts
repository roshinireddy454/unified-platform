import React from 'react';
import { MessageContextValue } from '../../context';
import type { ReactionGroupResponse, ReactionResponse } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../types/types';
import type { ReactionOptions } from './reactionOptions';
import type { ReactionDetailsComparator, ReactionsComparator } from './types';
export type ReactionsListProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Partial<Pick<MessageContextValue<StreamChatGenerics>, 'handleFetchReactions' | 'reactionDetailsSort'>> & {
    /** An array of the own reaction objects to distinguish own reactions visually */
    own_reactions?: ReactionResponse<StreamChatGenerics>[];
    /**
     * An object that keeps track of the count of each type of reaction on a message
     * @deprecated This override value is no longer taken into account. Use `reaction_groups` to override reaction counts instead.
     * */
    reaction_counts?: Record<string, number>;
    /** An object containing summary for each reaction type on a message */
    reaction_groups?: Record<string, ReactionGroupResponse>;
    /**
     * @deprecated
     * A list of the currently supported reactions on a message
     * */
    reactionOptions?: ReactionOptions;
    /** An array of the reaction objects to display in the list */
    reactions?: ReactionResponse<StreamChatGenerics>[];
    /** Display the reactions in the list in reverse order, defaults to false */
    reverse?: boolean;
    /** Comparator function to sort the list of reacted users
     * @deprecated use `reactionDetailsSort` instead
     */
    sortReactionDetails?: ReactionDetailsComparator<StreamChatGenerics>;
    /** Comparator function to sort reactions, defaults to chronological order */
    sortReactions?: ReactionsComparator;
};
/**
 * Component that displays a list of reactions on a message.
 */
export declare const ReactionsList: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: ReactionsListProps<StreamChatGenerics>) => React.JSX.Element | null;
