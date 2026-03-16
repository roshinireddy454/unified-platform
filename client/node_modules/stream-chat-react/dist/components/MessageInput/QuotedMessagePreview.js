import React, { useMemo } from 'react';
import { CloseIcon } from './icons';
import { Attachment as DefaultAttachment } from '../Attachment';
import { Avatar as DefaultAvatar } from '../Avatar';
import { Poll } from '../Poll';
import { useChatContext } from '../../context/ChatContext';
import { useChannelActionContext } from '../../context/ChannelActionContext';
import { useComponentContext } from '../../context/ComponentContext';
import { useTranslationContext } from '../../context/TranslationContext';
import { renderText as defaultRenderText } from '../Message';
export const QuotedMessagePreviewHeader = () => {
    const { setQuotedMessage } = useChannelActionContext('QuotedMessagePreview');
    const { t } = useTranslationContext('QuotedMessagePreview');
    return (React.createElement("div", { className: 'str-chat__quoted-message-preview-header' },
        React.createElement("div", { className: 'str-chat__quoted-message-reply-to-message' }, t('Reply to Message')),
        React.createElement("button", { "aria-label": t('aria/Cancel Reply'), className: 'str-chat__quoted-message-remove', onClick: () => setQuotedMessage(undefined) },
            React.createElement(CloseIcon, null))));
};
export const QuotedMessagePreview = ({ quotedMessage, renderText = defaultRenderText, }) => {
    const { client } = useChatContext();
    const { Attachment = DefaultAttachment, Avatar = DefaultAvatar } = useComponentContext('QuotedMessagePreview');
    const { userLanguage } = useTranslationContext('QuotedMessagePreview');
    const quotedMessageText = quotedMessage.i18n?.[`${userLanguage}_text`] ||
        quotedMessage.text;
    const renderedText = useMemo(() => renderText(quotedMessageText, quotedMessage.mentioned_users), [quotedMessage.mentioned_users, quotedMessageText, renderText]);
    const quotedMessageAttachment = useMemo(() => {
        const [attachment] = quotedMessage.attachments ?? [];
        return attachment ? [attachment] : [];
    }, [quotedMessage.attachments]);
    if (!quotedMessageText && !quotedMessageAttachment)
        return null;
    const poll = quotedMessage.poll_id && client.polls.fromState(quotedMessage.poll_id);
    return (React.createElement("div", { className: 'str-chat__quoted-message-preview', "data-testid": 'quoted-message-preview' },
        quotedMessage.user && (React.createElement(Avatar, { className: 'str-chat__avatar--quoted-message-sender', image: quotedMessage.user.image, name: quotedMessage.user.name || quotedMessage.user.id, user: quotedMessage.user })),
        React.createElement("div", { className: 'str-chat__quoted-message-bubble' }, poll ? (React.createElement(Poll, { isQuoted: true, poll: poll })) : (React.createElement(React.Fragment, null,
            !!quotedMessageAttachment.length && (React.createElement(Attachment, { attachments: quotedMessageAttachment, isQuoted: true })),
            React.createElement("div", { className: 'str-chat__quoted-message-text', "data-testid": 'quoted-message-text' }, renderedText))))));
};
