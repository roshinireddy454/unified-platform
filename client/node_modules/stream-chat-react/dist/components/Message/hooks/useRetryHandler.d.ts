import { RetrySendMessage } from '../../../context/ChannelActionContext';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export declare const useRetryHandler: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(customRetrySendMessage?: RetrySendMessage<StreamChatGenerics>) => RetrySendMessage<StreamChatGenerics>;
