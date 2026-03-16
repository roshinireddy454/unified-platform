import React from 'react';
import type { UserResponse } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type AvatarProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    /** Custom root element class that will be merged with the default class */
    className?: string;
    /** Image URL or default is an image of the first initial of the name if there is one  */
    image?: string | null;
    /** Name of the image, used for title tag fallback */
    name?: string;
    /** click event handler attached to the component root element */
    onClick?: (event: React.BaseSyntheticEvent) => void;
    /** mouseOver event handler attached to the component root element */
    onMouseOver?: (event: React.BaseSyntheticEvent) => void;
    /** The entire user object for the chat user displayed in the component */
    user?: UserResponse<StreamChatGenerics>;
};
/**
 * A round avatar image with fallback to username's first letter
 */
export declare const Avatar: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: AvatarProps<StreamChatGenerics>) => React.JSX.Element;
