import { StreamMessage } from '../../../context/ChannelStateContext';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export declare const useUserRole: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(message: StreamMessage<StreamChatGenerics>, onlySenderCanEdit?: boolean, disableQuotedMessages?: boolean) => {
    canDelete: boolean;
    canEdit: boolean;
    canFlag: boolean;
    canMarkUnread: boolean;
    canMute: boolean;
    canQuote: boolean;
    canReact: boolean;
    canReply: boolean;
    isAdmin: boolean;
    isModerator: boolean;
    isMyMessage: boolean;
    isOwner: boolean;
};
