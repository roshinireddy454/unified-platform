import type { ReactionsListProps } from '../ReactionsList';
import type { DefaultStreamChatGenerics } from '../../../types/types';
import type { ReactionsComparator, ReactionSummary } from '../types';
type SharedReactionListProps = 'own_reactions' | 'reaction_counts' | 'reaction_groups' | 'reactionOptions' | 'reactions';
type UseProcessReactionsParams = Pick<ReactionsListProps, SharedReactionListProps> & {
    sortReactions?: ReactionsComparator;
};
export declare const defaultReactionsSort: ReactionsComparator;
export declare const useProcessReactions: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(params: UseProcessReactionsParams) => {
    existingReactions: ReactionSummary[];
    hasReactions: boolean;
    totalReactionCount: number;
};
export {};
