import React from 'react';
import { useCommandTrigger } from './hooks/useCommandTrigger';
import { useEmojiTrigger } from './hooks/useEmojiTrigger';
import { useUserTrigger } from './hooks/useUserTrigger';
import { MessageInputContextProvider, useMessageInputContext, } from '../../context/MessageInputContext';
export const DefaultTriggerProvider = ({ children, }) => {
    const currentValue = useMessageInputContext('DefaultTriggerProvider');
    const defaultAutocompleteTriggers = {
        '/': useCommandTrigger(),
        ':': useEmojiTrigger(currentValue.emojiSearchIndex),
        '@': useUserTrigger({
            disableMentions: currentValue.disableMentions,
            mentionAllAppUsers: currentValue.mentionAllAppUsers,
            mentionQueryParams: currentValue.mentionQueryParams,
            onSelectUser: currentValue.onSelectUser,
            useMentionsTransliteration: currentValue.useMentionsTransliteration,
        }),
    };
    const newValue = {
        ...currentValue,
        autocompleteTriggers: defaultAutocompleteTriggers,
    };
    return (React.createElement(MessageInputContextProvider, { value: newValue }, children));
};
