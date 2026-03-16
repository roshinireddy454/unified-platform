import { TranslationContextValue } from '../../../context/TranslationContext';
import { Streami18n, SupportedTranslations } from '../../../i18n';
import type { AppSettingsAPIResponse, Channel, Mute, StreamChat } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export type UseChatParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    client: StreamChat<StreamChatGenerics>;
    defaultLanguage?: SupportedTranslations;
    i18nInstance?: Streami18n;
    initialNavOpen?: boolean;
};
export declare const useChat: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ client, defaultLanguage, i18nInstance, initialNavOpen, }: UseChatParams<StreamChatGenerics>) => {
    channel: Channel<StreamChatGenerics> | undefined;
    closeMobileNav: () => void;
    getAppSettings: () => Promise<AppSettingsAPIResponse<StreamChatGenerics>>;
    latestMessageDatesByChannels: {};
    mutes: Mute<StreamChatGenerics>[];
    navOpen: boolean | undefined;
    openMobileNav: () => NodeJS.Timeout;
    setActiveChannel: (activeChannel?: Channel<StreamChatGenerics>, watchers?: {
        limit?: number;
        offset?: number;
    }, event?: React.BaseSyntheticEvent) => Promise<void>;
    translators: TranslationContextValue;
};
