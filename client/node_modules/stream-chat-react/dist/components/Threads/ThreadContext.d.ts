import React from 'react';
import type { PropsWithChildren } from 'react';
import { Thread } from 'stream-chat';
export type ThreadContextValue = Thread | undefined;
export declare const ThreadContext: React.Context<ThreadContextValue>;
export declare const useThreadContext: () => Thread<import("stream-chat").DefaultGenerics> | undefined;
export declare const ThreadProvider: ({ children, thread, }: PropsWithChildren<{
    thread?: Thread;
}>) => React.JSX.Element;
