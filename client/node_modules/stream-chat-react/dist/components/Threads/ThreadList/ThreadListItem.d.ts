import React from 'react';
import type { Thread } from 'stream-chat';
import type { ThreadListItemUIProps } from './ThreadListItemUI';
export type ThreadListItemProps = {
    thread: Thread;
    threadListItemUIProps?: ThreadListItemUIProps;
};
export declare const useThreadListItemContext: () => Thread<import("stream-chat").DefaultGenerics> | undefined;
export declare const ThreadListItem: ({ thread, threadListItemUIProps, }: ThreadListItemProps) => React.JSX.Element;
