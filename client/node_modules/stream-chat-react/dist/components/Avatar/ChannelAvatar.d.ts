import React from 'react';
import { AvatarProps, GroupAvatarProps } from './index';
import type { DefaultStreamChatGenerics } from '../../types';
export type ChannelAvatarProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Partial<GroupAvatarProps> & AvatarProps<StreamChatGenerics>;
export declare const ChannelAvatar: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ groupChannelDisplayInfo, image, name, user, ...sharedProps }: ChannelAvatarProps<StreamChatGenerics>) => React.JSX.Element;
