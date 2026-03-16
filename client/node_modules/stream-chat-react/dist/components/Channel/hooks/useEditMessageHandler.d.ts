import type { StreamChat, UpdatedMessage } from 'stream-chat';
import type { DefaultStreamChatGenerics, UpdateMessageOptions } from '../../../types/types';
type UpdateHandler<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = (cid: string, updatedMessage: UpdatedMessage<StreamChatGenerics>, options?: UpdateMessageOptions) => ReturnType<StreamChat<StreamChatGenerics>['updateMessage']>;
export declare const useEditMessageHandler: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(doUpdateMessageRequest?: UpdateHandler<StreamChatGenerics>) => (updatedMessage: UpdatedMessage<StreamChatGenerics>, options?: UpdateMessageOptions) => Promise<import("stream-chat").UpdateMessageAPIResponse<StreamChatGenerics>>;
export {};
