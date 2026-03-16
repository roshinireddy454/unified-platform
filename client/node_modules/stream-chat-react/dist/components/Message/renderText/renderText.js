import React from 'react';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import { find } from 'linkifyjs';
import uniqBy from 'lodash.uniqby';
import remarkGfm from 'remark-gfm';
import { Anchor, Emoji, Mention } from './componentRenderers';
import { detectHttp, escapeRegExp, matchMarkdownLinks, messageCodeBlocks } from './regex';
import { emojiMarkdownPlugin, mentionsMarkdownPlugin } from './rehypePlugins';
import { htmlToTextPlugin, keepLineBreaksPlugin } from './remarkPlugins';
import { ErrorBoundary } from '../../UtilityComponents';
export const defaultAllowedTagNames = [
    'html',
    'text',
    'br',
    'p',
    'em',
    'strong',
    'a',
    'ol',
    'ul',
    'li',
    'code',
    'pre',
    'blockquote',
    'del',
    'table',
    'thead',
    'tbody',
    'th',
    'tr',
    'td',
    'tfoot',
    // custom types (tagNames)
    'emoji',
    'mention',
];
function formatUrlForDisplay(url) {
    try {
        return decodeURIComponent(url).replace(detectHttp, '');
    }
    catch (e) {
        return url;
    }
}
function encodeDecode(url) {
    try {
        return encodeURI(decodeURIComponent(url));
    }
    catch (error) {
        return url;
    }
}
const urlTransform = (uri) => uri.startsWith('app://') ? uri : defaultUrlTransform(uri);
const getPluginsForward = (plugins) => plugins;
export const markDownRenderers = {
    a: Anchor,
    emoji: Emoji,
    mention: Mention,
};
export const renderText = (text, mentionedUsers, { allowedTagNames = defaultAllowedTagNames, customMarkDownRenderers, getRehypePlugins = getPluginsForward, getRemarkPlugins = getPluginsForward, } = {}) => {
    // take the @ mentions and turn them into markdown?
    // translate links
    if (!text)
        return null;
    if (text.trim().length === 1)
        return React.createElement(React.Fragment, null, text);
    let newText = text;
    const markdownLinks = matchMarkdownLinks(newText);
    const codeBlocks = messageCodeBlocks(newText);
    // extract all valid links/emails within text and replace it with proper markup
    uniqBy([...find(newText, 'email'), ...find(newText, 'url')], 'value').forEach(({ href, type, value }) => {
        const linkIsInBlock = codeBlocks.some((block) => block?.includes(value));
        // check if message is already  markdown
        const noParsingNeeded = markdownLinks &&
            markdownLinks.filter((text) => {
                const strippedHref = href?.replace(detectHttp, '');
                const strippedText = text?.replace(detectHttp, '');
                if (!strippedHref || !strippedText)
                    return false;
                return (strippedHref.includes(strippedText) || strippedText.includes(strippedHref));
            });
        if (noParsingNeeded.length > 0 || linkIsInBlock)
            return;
        try {
            // special case for mentions:
            // it could happen that a user's name matches with an e-mail format pattern.
            // in that case, we check whether the found e-mail is actually a mention
            // by naively checking for an existence of @ sign in front of it.
            if (type === 'email' && mentionedUsers) {
                const emailMatchesWithName = mentionedUsers.some((u) => u.name === value);
                if (emailMatchesWithName) {
                    newText = newText.replace(new RegExp(escapeRegExp(value), 'g'), (match, position) => {
                        const isMention = newText.charAt(position - 1) === '@';
                        // in case of mention, we leave the match in its original form,
                        // and we let `mentionsMarkdownPlugin` to do its job
                        return isMention ? match : `[${match}](${encodeDecode(href)})`;
                    });
                    return;
                }
            }
            const displayLink = type === 'email' ? value : formatUrlForDisplay(href);
            newText = newText.replace(new RegExp(escapeRegExp(value), 'g'), `[${displayLink}](${encodeDecode(href)})`);
        }
        catch (e) {
            void e;
        }
    });
    const remarkPlugins = [
        htmlToTextPlugin,
        keepLineBreaksPlugin,
        [remarkGfm, { singleTilde: false }],
    ];
    const rehypePlugins = [emojiMarkdownPlugin];
    if (mentionedUsers?.length) {
        rehypePlugins.push(mentionsMarkdownPlugin(mentionedUsers));
    }
    return (React.createElement(ErrorBoundary, { fallback: React.createElement(React.Fragment, null, text) },
        React.createElement(ReactMarkdown, { allowedElements: allowedTagNames, components: {
                ...markDownRenderers,
                ...customMarkDownRenderers,
            }, rehypePlugins: getRehypePlugins(rehypePlugins), remarkPlugins: getRemarkPlugins(remarkPlugins), skipHtml: true, unwrapDisallowed: true, urlTransform: urlTransform }, newText)));
};
