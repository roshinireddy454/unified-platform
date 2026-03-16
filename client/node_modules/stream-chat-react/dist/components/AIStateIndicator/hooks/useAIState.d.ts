import { AIState, Channel } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export declare const AIStates: {
    Error: string;
    ExternalSources: string;
    Generating: string;
    Idle: string;
    Thinking: string;
};
/**
 * A hook that returns the current state of the AI.
 * @param {Channel} channel - The channel for which we want to know the AI state.
 * @returns {{ aiState: AIState }} The current AI state for the given channel.
 */
export declare const useAIState: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(channel?: Channel<StreamChatGenerics>) => {
    aiState: AIState;
};
