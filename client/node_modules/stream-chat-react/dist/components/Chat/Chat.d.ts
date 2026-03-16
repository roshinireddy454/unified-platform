import React, { PropsWithChildren } from 'react';
import type { StreamChat } from 'stream-chat';
import { SearchController } from 'stream-chat';
import { CustomClasses } from '../../context/ChatContext';
import type { MessageContextValue } from '../../context';
import type { SupportedTranslations } from '../../i18n/types';
import type { Streami18n } from '../../i18n/Streami18n';
import type { DefaultStreamChatGenerics } from '../../types/types';
export type ChatProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    /** The StreamChat client object */
    client: StreamChat<StreamChatGenerics>;
    /** Object containing custom CSS classnames to override the library's default container CSS */
    customClasses?: CustomClasses;
    /** Sets the default fallback language for UI component translation, defaults to 'en' for English */
    defaultLanguage?: SupportedTranslations;
    /** Instance of Stream i18n */
    i18nInstance?: Streami18n;
    /** Initial status of mobile navigation */
    initialNavOpen?: boolean;
    /** Instance of SearchController class that allows to control all the search operations. */
    searchController?: SearchController<StreamChatGenerics>;
    /** Used for injecting className/s to the Channel and ChannelList components */
    theme?: string;
    /**
     * Windows 10 does not support country flag emojis out of the box. It chooses to render these emojis as characters instead. Stream
     * Chat can override this behavior by loading a custom web font that will render images instead (PNGs or SVGs depending on the platform).
     * Set this prop to true if you want to use these custom emojis for Windows users.
     *
     * Note: requires importing `stream-chat-react/css/v2/emoji-replacement.css` style sheet
     */
    useImageFlagEmojisOnWindows?: boolean;
} & Partial<Pick<MessageContextValue<StreamChatGenerics>, 'isMessageAIGenerated'>>;
/**
 * Wrapper component for a StreamChat application. Chat needs to be placed around any other chat components
 * as it provides the ChatContext.
 */
export declare const Chat: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(props: PropsWithChildren<ChatProps<StreamChatGenerics>>) => React.JSX.Element | null;
