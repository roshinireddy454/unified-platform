import React from 'react';
import type { DefaultStreamChatGenerics } from '../../types';
import type { IconProps } from '../../types/types';
type ReactionSelectorWithButtonProps = {
    ReactionIcon: React.ComponentType<IconProps>;
};
/**
 * Internal convenience component - not to be exported. It just groups the button and the dialog anchor and thus prevents
 * cluttering the parent component.
 */
export declare const ReactionSelectorWithButton: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ ReactionIcon, }: ReactionSelectorWithButtonProps) => React.JSX.Element;
export {};
