import React from 'react';
import type { Channel, ExtendableGenerics } from 'stream-chat';
export type ChannelPreviewActionButtonsProps<SCG extends ExtendableGenerics> = {
    channel: Channel<SCG>;
};
export declare function ChannelPreviewActionButtons<SCG extends ExtendableGenerics>({ channel, }: ChannelPreviewActionButtonsProps<SCG>): React.JSX.Element;
