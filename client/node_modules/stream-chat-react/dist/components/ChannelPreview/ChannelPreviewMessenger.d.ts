import React from 'react';
import type { ChannelPreviewUIComponentProps } from './ChannelPreview';
import type { DefaultStreamChatGenerics } from '../../types/types';
/**
 * Used as preview component for channel item in [ChannelList](#channellist) component.
 * Its best suited for messenger type chat.
 */
export declare const ChannelPreviewMessenger: <SCG extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: ChannelPreviewUIComponentProps<SCG>) => React.JSX.Element;
