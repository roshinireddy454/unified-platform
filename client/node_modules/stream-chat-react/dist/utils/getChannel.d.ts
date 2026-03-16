import type { Channel, ChannelQueryOptions, StreamChat } from 'stream-chat';
import type { DefaultStreamChatGenerics } from '../types/types';
type GetChannelParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    client: StreamChat<StreamChatGenerics>;
    channel?: Channel<StreamChatGenerics>;
    id?: string;
    members?: string[];
    options?: ChannelQueryOptions<StreamChatGenerics>;
    type?: string;
};
/**
 * Calls channel.watch() if it was not already recently called. Waits for watch promise to resolve even if it was invoked previously.
 * @param client
 * @param members
 * @param options
 * @param type
 * @param id
 * @param channel
 */
export declare const getChannel: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ channel, client, id, members, options, type, }: GetChannelParams<StreamChatGenerics>) => Promise<Channel<StreamChatGenerics>>;
export {};
