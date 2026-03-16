import React from 'react';
import type { ReactionDetailsComparator, ReactionSummary, ReactionType } from './types';
import { ModalProps } from '../Modal';
import { MessageContextValue } from '../../context';
import { DefaultStreamChatGenerics } from '../../types/types';
import { ReactionSort } from 'stream-chat';
export type ReactionsListModalProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = ModalProps & Partial<Pick<MessageContextValue<StreamChatGenerics>, 'handleFetchReactions' | 'reactionDetailsSort'>> & {
    reactions: ReactionSummary[];
    selectedReactionType: ReactionType<StreamChatGenerics>;
    onSelectedReactionTypeChange?: (reactionType: ReactionType<StreamChatGenerics>) => void;
    sort?: ReactionSort<StreamChatGenerics>;
    /** @deprecated use `sort` instead */
    sortReactionDetails?: ReactionDetailsComparator<StreamChatGenerics>;
};
export declare function ReactionsListModal<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ handleFetchReactions, onSelectedReactionTypeChange, reactionDetailsSort: propReactionDetailsSort, reactions, selectedReactionType, sortReactionDetails: propSortReactionDetails, ...modalProps }: ReactionsListModalProps<StreamChatGenerics>): React.JSX.Element;
