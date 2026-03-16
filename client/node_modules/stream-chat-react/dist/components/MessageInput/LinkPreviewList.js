import clsx from 'clsx';
import React, { useState } from 'react';
import { useChannelStateContext, useMessageInputContext } from '../../context';
import { LinkPreviewState } from './types';
import { CloseIcon, LinkIcon } from './icons';
import { PopperTooltip } from '../Tooltip';
import { useEnterLeaveHandlers } from '../Tooltip/hooks';
export const LinkPreviewList = ({ linkPreviews }) => {
    const { quotedMessage } = useChannelStateContext();
    const showLinkPreviews = linkPreviews.length > 0 && !quotedMessage;
    if (!showLinkPreviews)
        return null;
    return (React.createElement("div", { className: 'str-chat__link-preview-list' }, Array.from(linkPreviews.values()).map((linkPreview) => linkPreview.state === LinkPreviewState.LOADED ? (React.createElement(LinkPreviewCard, { key: linkPreview.og_scrape_url, linkPreview: linkPreview })) : null)));
};
const LinkPreviewCard = ({ linkPreview }) => {
    const { dismissLinkPreview } = useMessageInputContext();
    const { handleEnter, handleLeave, tooltipVisible } = useEnterLeaveHandlers();
    const [referenceElement, setReferenceElement] = useState(null);
    return (React.createElement("div", { className: clsx('str-chat__link-preview-card', {
            'str-chat__link-preview-card--loading': linkPreview.state === LinkPreviewState.LOADING,
        }), "data-testid": 'link-preview-card' },
        React.createElement(PopperTooltip, { offset: [0, 5], referenceElement: referenceElement, visible: tooltipVisible }, linkPreview.og_scrape_url),
        React.createElement("div", { className: 'str-chat__link-preview-card__icon-container', onMouseEnter: handleEnter, onMouseLeave: handleLeave, ref: setReferenceElement },
            React.createElement(LinkIcon, null)),
        React.createElement("div", { className: 'str-chat__link-preview-card__content' },
            React.createElement("div", { className: 'str-chat__link-preview-card__content-title' }, linkPreview.title),
            React.createElement("div", { className: 'str-chat__link-preview-card__content-description' }, linkPreview.text)),
        React.createElement("button", { className: 'str-chat__link-preview-card__dismiss-button', "data-testid": 'link-preview-card-dismiss-btn', onClick: () => dismissLinkPreview(linkPreview) },
            React.createElement(CloseIcon, null))));
};
