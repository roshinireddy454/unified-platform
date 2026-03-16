import type { Channel } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export declare const useUserPresenceChangedListener: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(setChannels: React.Dispatch<React.SetStateAction<Array<Channel<StreamChatGenerics>>>>) => void;
