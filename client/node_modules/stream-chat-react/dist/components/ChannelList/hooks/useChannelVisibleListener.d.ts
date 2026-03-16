import type { Channel, Event } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../../../types/types';
export declare const useChannelVisibleListener: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(setChannels: React.Dispatch<React.SetStateAction<Array<Channel<StreamChatGenerics>>>>, customHandler?: (setChannels: React.Dispatch<React.SetStateAction<Array<Channel<StreamChatGenerics>>>>, event: Event<StreamChatGenerics>) => void) => void;
