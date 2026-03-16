import React, { PropsWithChildren } from 'react';
import type { Poll } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../types';
export type PollContextValue<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    poll: Poll<StreamChatGenerics>;
};
export declare const PollContext: React.Context<PollContextValue<DefaultStreamChatGenerics> | undefined>;
export declare const PollProvider: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ children, poll, }: PropsWithChildren<{
    poll: Poll<StreamChatGenerics>;
}>) => React.JSX.Element | null;
export declare const usePollContext: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>() => PollContextValue<StreamChatGenerics>;
