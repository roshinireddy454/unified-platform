import type { Channel, ChannelMemberResponse, ExtendableGenerics } from 'stream-chat';
export declare function useChannelMembershipState<SCG extends ExtendableGenerics>(channel: Channel<SCG>): ChannelMemberResponse<SCG>;
export declare function useChannelMembershipState<SCG extends ExtendableGenerics>(channel?: Channel<SCG> | undefined): ChannelMemberResponse<SCG> | undefined;
