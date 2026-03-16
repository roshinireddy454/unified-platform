import React from 'react';
import { AvatarProps } from './Avatar';
import { GroupChannelDisplayInfo } from '../ChannelPreview';
export type GroupAvatarProps = Pick<AvatarProps, 'className' | 'onClick' | 'onMouseOver'> & {
    /** Mapping of image URLs to names which initials will be used as fallbacks in case image assets fail to load. */
    groupChannelDisplayInfo: GroupChannelDisplayInfo;
};
export declare const GroupAvatar: ({ className, groupChannelDisplayInfo, onClick, onMouseOver, }: GroupAvatarProps) => React.JSX.Element;
