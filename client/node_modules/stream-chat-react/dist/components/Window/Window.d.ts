import React, { PropsWithChildren } from 'react';
import { StreamMessage } from '../../context/ChannelStateContext';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type WindowProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    /** optional prop to force addition of class str-chat__main-panel---with-thread-opn to the Window root element */
    thread?: StreamMessage<StreamChatGenerics>;
};
/**
 * A UI component for conditionally displaying a Thread or Channel
 */
export declare const Window: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: PropsWithChildren<WindowProps<StreamChatGenerics>>) => React.JSX.Element;
