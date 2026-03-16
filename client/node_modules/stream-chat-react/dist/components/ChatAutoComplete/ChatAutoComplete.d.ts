import React from 'react';
import type { CommandResponse, UserResponse } from 'stream-chat';
import type { TriggerSettings } from '../MessageInput/DefaultTriggerProvider';
import type { CustomTrigger, DefaultStreamChatGenerics, UnknownType } from '../../types/types';
import { EmojiSearchIndex, EmojiSearchIndexResult } from '../MessageInput';
type ObjectUnion<T> = T[keyof T];
export type SuggestionCommand<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = CommandResponse<StreamChatGenerics>;
export type SuggestionUser<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = UserResponse<StreamChatGenerics>;
export type SuggestionEmoji<T extends UnknownType = UnknownType> = EmojiSearchIndexResult & T;
export type SuggestionItem<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, T extends UnknownType = UnknownType> = SuggestionUser<StreamChatGenerics> | SuggestionCommand<StreamChatGenerics> | SuggestionEmoji<T>;
export type SuggestionItemProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, T extends UnknownType = UnknownType> = {
    className: string;
    component: React.ComponentType<{
        entity: SuggestionItem<StreamChatGenerics, T>;
        selected: boolean;
    }>;
    item: SuggestionItem<StreamChatGenerics, T>;
    key: React.Key;
    onClickHandler: (event: React.BaseSyntheticEvent, item: SuggestionItem<StreamChatGenerics, T>) => void;
    onSelectHandler: (item: SuggestionItem<StreamChatGenerics, T>) => void;
    selected: boolean;
    style: React.CSSProperties;
    value: string;
};
export interface SuggestionHeaderProps {
    currentTrigger: string;
    value: string;
}
export type SuggestionListProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, V extends CustomTrigger = CustomTrigger> = ObjectUnion<{
    [key in keyof TriggerSettings<StreamChatGenerics, V>]: {
        component: TriggerSettings<StreamChatGenerics, V>[key]['component'];
        currentTrigger: string;
        dropdownScroll: (element: HTMLDivElement) => void;
        getSelectedItem: ((item: Parameters<TriggerSettings<StreamChatGenerics, V>[key]['output']>[0]) => void) | null;
        getTextToReplace: (item: Parameters<TriggerSettings<StreamChatGenerics, V>[key]['output']>[0]) => {
            caretPosition: 'start' | 'end' | 'next' | number;
            text: string;
            key?: string;
        };
        Header: React.ComponentType<SuggestionHeaderProps>;
        onSelect: (newToken: {
            caretPosition: 'start' | 'end' | 'next' | number;
            text: string;
        }) => void;
        selectionEnd: number;
        SuggestionItem: React.ComponentType<SuggestionItemProps>;
        values: Parameters<Parameters<TriggerSettings<StreamChatGenerics, V>[key]['dataProvider']>[2]>[0];
        className?: string;
        itemClassName?: string;
        itemStyle?: React.CSSProperties;
        style?: React.CSSProperties;
        value?: string;
    };
}>;
export type ChatAutoCompleteProps<T extends UnknownType = UnknownType> = {
    /** Override the default disabled state of the underlying `textarea` component. */
    disabled?: boolean;
    /** Function to override the default submit handler on the underlying `textarea` component */
    handleSubmit?: (event: React.BaseSyntheticEvent) => void;
    /** Function to run on blur of the underlying `textarea` component */
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
    /** Function to override the default onChange behavior on the underlying `textarea` component */
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    /** Function to run on focus of the underlying `textarea` component */
    onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
    /** Function to override the default onPaste behavior on the underlying `textarea` component */
    onPaste?: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
    /** Placeholder for the underlying `textarea` component */
    placeholder?: string;
    /** The initial number of rows for the underlying `textarea` component */
    rows?: number;
    /** The text value of the underlying `textarea` component */
    value?: string;
    /** Function to override the default emojiReplace behavior on the `wordReplace` prop of the `textarea` component */
    wordReplace?: (word: string, emojiIndex?: EmojiSearchIndex<T>) => string;
};
export declare const ChatAutoComplete: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, V extends CustomTrigger = CustomTrigger>(props: ChatAutoCompleteProps) => React.JSX.Element;
export {};
