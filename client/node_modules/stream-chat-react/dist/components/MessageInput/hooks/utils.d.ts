import type { UserResponse } from 'stream-chat';
import type { ChannelActionContextValue } from '../../../context/ChannelActionContext';
import type { ChatContextValue } from '../../../context/ChatContext';
import type { TranslationContextValue } from '../../../context/TranslationContext';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export declare const accentsMap: {
    [key: string]: string;
};
export declare const removeDiacritics: (text?: string) => string;
export declare const calculateLevenshtein: (query: string, name: string) => number;
export type SearchLocalUserParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    ownUserId: string | undefined;
    query: string;
    text: string;
    users: UserResponse<StreamChatGenerics>[];
    useMentionsTransliteration?: boolean;
};
export declare const searchLocalUsers: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(params: SearchLocalUserParams<StreamChatGenerics>) => UserResponse<StreamChatGenerics>[];
type CheckUploadPermissionsParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    addNotification: ChannelActionContextValue<StreamChatGenerics>['addNotification'];
    file: File;
    getAppSettings: ChatContextValue<StreamChatGenerics>['getAppSettings'];
    t: TranslationContextValue['t'];
    uploadType: 'image' | 'file';
};
export declare const checkUploadPermissions: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(params: CheckUploadPermissionsParams<StreamChatGenerics>) => Promise<boolean>;
export declare function prettifyFileSize(bytes: number, precision?: number): string;
export {};
