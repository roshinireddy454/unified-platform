import React, { useCallback } from 'react';
import { AutoCompleteTextarea } from '../AutoCompleteTextarea';
import { LoadingIndicator } from '../Loading/LoadingIndicator';
import { useMessageInputContext } from '../../context/MessageInputContext';
import { useTranslationContext } from '../../context/TranslationContext';
import { useComponentContext } from '../../context/ComponentContext';
const UnMemoizedChatAutoComplete = (props) => {
    const { AutocompleteSuggestionItem: SuggestionItem, AutocompleteSuggestionList: SuggestionList, } = useComponentContext('ChatAutoComplete');
    const { t } = useTranslationContext('ChatAutoComplete');
    const messageInput = useMessageInputContext('ChatAutoComplete');
    const { cooldownRemaining, disabled, emojiSearchIndex, textareaRef: innerRef, } = messageInput;
    const placeholder = props.placeholder || t('Type your message');
    const emojiReplace = props.wordReplace
        ? (word) => props.wordReplace?.(word, emojiSearchIndex)
        : async (word) => {
            const found = (await emojiSearchIndex?.search(word)) || [];
            const emoji = found
                .filter(Boolean)
                .slice(0, 10)
                .find(({ emoticons }) => !!emoticons?.includes(word));
            if (!emoji)
                return null;
            const [firstSkin] = emoji.skins ?? [];
            return emoji.native ?? firstSkin.native;
        };
    const updateInnerRef = useCallback((ref) => {
        if (innerRef) {
            innerRef.current = ref;
        }
    }, [innerRef]);
    return (React.createElement(AutoCompleteTextarea, { additionalTextareaProps: messageInput.additionalTextareaProps, "aria-label": cooldownRemaining ? t('Slow Mode ON') : placeholder, className: 'str-chat__textarea__textarea str-chat__message-textarea', closeCommandsList: messageInput.closeCommandsList, closeMentionsList: messageInput.closeMentionsList, containerClassName: 'str-chat__textarea str-chat__message-textarea-react-host', disabled: (props.disabled ?? disabled) || !!cooldownRemaining, disableMentions: messageInput.disableMentions, grow: messageInput.grow, handleSubmit: props.handleSubmit || messageInput.handleSubmit, innerRef: updateInnerRef, loadingComponent: LoadingIndicator, maxRows: messageInput.maxRows, minChar: 0, minRows: messageInput.minRows, onBlur: props.onBlur, onChange: props.onChange || messageInput.handleChange, onFocus: props.onFocus, onPaste: props.onPaste || messageInput.onPaste, placeholder: cooldownRemaining ? t('Slow Mode ON') : placeholder, replaceWord: emojiReplace, rows: props.rows || 1, shouldSubmit: messageInput.shouldSubmit, showCommandsList: messageInput.showCommandsList, showMentionsList: messageInput.showMentionsList, SuggestionItem: SuggestionItem, SuggestionList: SuggestionList, trigger: messageInput.autocompleteTriggers || {}, value: props.value || messageInput.text }));
};
export const ChatAutoComplete = React.memo(UnMemoizedChatAutoComplete);
