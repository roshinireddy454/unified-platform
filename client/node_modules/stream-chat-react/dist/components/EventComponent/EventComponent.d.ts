import React from 'react';
import { AvatarProps } from '../Avatar';
import type { StreamMessage } from '../../context/ChannelStateContext';
import type { DefaultStreamChatGenerics } from '../../types/types';
import type { TimestampFormatterOptions } from '../../i18n/types';
export type EventComponentProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = TimestampFormatterOptions & {
    /** Message object */
    message: StreamMessage<StreamChatGenerics>;
    /** Custom UI component to display user avatar, defaults to and accepts same props as: [Avatar](https://github.com/GetStream/stream-chat-react/blob/master/src/components/Avatar/Avatar.tsx) */
    Avatar?: React.ComponentType<AvatarProps>;
};
export declare const EventComponent: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: EventComponentProps<StreamChatGenerics>) => React.JSX.Element | null;
