import type { StreamMessage } from '../../../../context/ChannelStateContext';
import type { DefaultStreamChatGenerics } from '../../../../types/types';
export declare function useShouldForceScrollToBottom<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(messages: StreamMessage<StreamChatGenerics>[], currentUserId?: string): () => boolean;
