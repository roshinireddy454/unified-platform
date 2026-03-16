import type { DefaultStreamChatGenerics } from '../../../types/types';
import type { StreamedMessageTextProps } from '../StreamedMessageText';
export type UseMessageTextStreamingProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Pick<StreamedMessageTextProps<StreamChatGenerics>, 'streamingLetterIntervalMs' | 'renderingLetterCount'> & {
    text: string;
};
/**
 * A hook that returns text in a streamed, typewriter fashion. The speed of streaming is
 * configurable.
 * @param {number} [streamingLetterIntervalMs=30] - The timeout between each typing animation in milliseconds.
 * @param {number} [renderingLetterCount=2] - The number of letters to be rendered each time we update.
 * @param {string} text - The text that we want to render in a typewriter fashion.
 * @returns {{ streamedMessageText: string }} - A substring of the text property, up until we've finished rendering the typewriter animation.
 */
export declare const useMessageTextStreaming: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ renderingLetterCount, streamingLetterIntervalMs, text, }: UseMessageTextStreamingProps<StreamChatGenerics>) => {
    streamedMessageText: string;
};
