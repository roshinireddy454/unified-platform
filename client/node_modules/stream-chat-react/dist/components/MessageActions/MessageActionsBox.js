import clsx from 'clsx';
import React from 'react';
import { MESSAGE_ACTIONS } from '../Message/utils';
import { useChannelActionContext, useComponentContext, useMessageContext, useTranslationContext, } from '../../context';
import { CustomMessageActionsList as DefaultCustomMessageActionsList } from './CustomMessageActionsList';
const UnMemoizedMessageActionsBox = (props) => {
    const { className, getMessageActions, handleDelete, handleEdit, handleFlag, handleMarkUnread, handleMute, handlePin, isUserMuted, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mine, open, ...restDivProps } = props;
    const { CustomMessageActionsList = DefaultCustomMessageActionsList } = useComponentContext('MessageActionsBox');
    const { setQuotedMessage } = useChannelActionContext('MessageActionsBox');
    const { customMessageActions, message, threadList } = useMessageContext('MessageActionsBox');
    const { t } = useTranslationContext('MessageActionsBox');
    const messageActions = getMessageActions();
    const handleQuote = () => {
        setQuotedMessage(message);
        const elements = message.parent_id
            ? document.querySelectorAll('.str-chat__thread .str-chat__textarea__textarea')
            : document.getElementsByClassName('str-chat__textarea__textarea');
        const textarea = elements.item(0);
        if (textarea instanceof HTMLTextAreaElement) {
            textarea.focus();
        }
    };
    const rootClassName = clsx('str-chat__message-actions-box', className, {
        'str-chat__message-actions-box--open': open,
    });
    const buttonClassName = 'str-chat__message-actions-list-item str-chat__message-actions-list-item-button';
    return (React.createElement("div", { ...restDivProps, className: rootClassName, "data-testid": 'message-actions-box' },
        React.createElement("div", { "aria-label": t('aria/Message Options'), className: 'str-chat__message-actions-list', role: 'listbox' },
            React.createElement(CustomMessageActionsList, { customMessageActions: customMessageActions, message: message }),
            messageActions.indexOf(MESSAGE_ACTIONS.quote) > -1 && (React.createElement("button", { "aria-selected": 'false', className: buttonClassName, onClick: handleQuote, role: 'option' }, t('Reply'))),
            messageActions.indexOf(MESSAGE_ACTIONS.pin) > -1 && !message.parent_id && (React.createElement("button", { "aria-selected": 'false', className: buttonClassName, onClick: handlePin, role: 'option' }, !message.pinned ? t('Pin') : t('Unpin'))),
            messageActions.indexOf(MESSAGE_ACTIONS.markUnread) > -1 &&
                !threadList &&
                !!message.id && (React.createElement("button", { "aria-selected": 'false', className: buttonClassName, onClick: handleMarkUnread, role: 'option' }, t('Mark as unread'))),
            messageActions.indexOf(MESSAGE_ACTIONS.flag) > -1 && (React.createElement("button", { "aria-selected": 'false', className: buttonClassName, onClick: handleFlag, role: 'option' }, t('Flag'))),
            messageActions.indexOf(MESSAGE_ACTIONS.mute) > -1 && (React.createElement("button", { "aria-selected": 'false', className: buttonClassName, onClick: handleMute, role: 'option' }, isUserMuted() ? t('Unmute') : t('Mute'))),
            messageActions.indexOf(MESSAGE_ACTIONS.edit) > -1 && (React.createElement("button", { "aria-selected": 'false', className: buttonClassName, onClick: handleEdit, role: 'option' }, t('Edit Message'))),
            messageActions.indexOf(MESSAGE_ACTIONS.delete) > -1 && (React.createElement("button", { "aria-selected": 'false', className: buttonClassName, onClick: handleDelete, role: 'option' }, t('Delete'))))));
};
/**
 * A popup box that displays the available actions on a message, such as edit, delete, pin, etc.
 */
export const MessageActionsBox = React.memo(UnMemoizedMessageActionsBox);
