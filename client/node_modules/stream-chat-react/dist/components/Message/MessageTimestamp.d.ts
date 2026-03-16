import React from 'react';
import type { StreamMessage } from '../../context/ChannelStateContext';
import type { TimestampFormatterOptions } from '../../i18n/types';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type MessageTimestampProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = TimestampFormatterOptions & {
    customClass?: string;
    message?: StreamMessage<StreamChatGenerics>;
};
export declare const MessageTimestamp: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: MessageTimestampProps<StreamChatGenerics>) => React.JSX.Element;
