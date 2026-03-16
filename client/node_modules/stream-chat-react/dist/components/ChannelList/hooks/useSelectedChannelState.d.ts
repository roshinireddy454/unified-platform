import type { Channel, EventTypes, ExtendableGenerics } from 'stream-chat';
export declare function useSelectedChannelState<SCG extends ExtendableGenerics, O>(_: {
    channel: Channel<SCG>;
    selector: (channel: Channel<SCG>) => O;
    stateChangeEventKeys?: EventTypes[];
}): O;
export declare function useSelectedChannelState<SCG extends ExtendableGenerics, O>(_: {
    selector: (channel: Channel<SCG>) => O;
    channel?: Channel<SCG> | undefined;
    stateChangeEventKeys?: EventTypes[];
}): O | undefined;
