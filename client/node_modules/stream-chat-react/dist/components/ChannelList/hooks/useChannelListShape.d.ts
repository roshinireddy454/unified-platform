import { Dispatch, SetStateAction } from 'react';
import { Channel, Event, ExtendableGenerics } from 'stream-chat';
import { ChannelListProps } from '../ChannelList';
type SetChannels<SCG extends ExtendableGenerics> = Dispatch<SetStateAction<Channel<SCG>[]>>;
type BaseParameters<SCG extends ExtendableGenerics> = {
    event: Event<SCG>;
    setChannels: SetChannels<SCG>;
};
type RepeatedParameters<SCG extends ExtendableGenerics> = {
    customHandler?: (setChannels: BaseParameters<SCG>['setChannels'], event: BaseParameters<SCG>['event']) => void;
};
type HandleMessageNewParameters<SCG extends ExtendableGenerics> = BaseParameters<SCG> & RepeatedParameters<SCG> & {
    allowNewMessagesFromUnfilteredChannels: boolean;
    lockChannelOrder: boolean;
} & Required<Pick<ChannelListProps<SCG>, 'filters' | 'sort'>>;
type HandleNotificationMessageNewParameters<SCG extends ExtendableGenerics> = BaseParameters<SCG> & RepeatedParameters<SCG> & {
    allowNewMessagesFromUnfilteredChannels: boolean;
    lockChannelOrder: boolean;
} & Required<Pick<ChannelListProps<SCG>, 'filters' | 'sort'>>;
type HandleNotificationRemovedFromChannelParameters<SCG extends ExtendableGenerics> = BaseParameters<SCG> & RepeatedParameters<SCG>;
type HandleNotificationAddedToChannelParameters<SCG extends ExtendableGenerics> = BaseParameters<SCG> & RepeatedParameters<SCG> & {
    allowNewMessagesFromUnfilteredChannels: boolean;
    lockChannelOrder: boolean;
} & Required<Pick<ChannelListProps<SCG>, 'sort'>>;
type HandleMemberUpdatedParameters<SCG extends ExtendableGenerics> = BaseParameters<SCG> & {
    lockChannelOrder: boolean;
} & Required<Pick<ChannelListProps<SCG>, 'sort' | 'filters'>>;
type HandleChannelDeletedParameters<SCG extends ExtendableGenerics> = BaseParameters<SCG> & RepeatedParameters<SCG>;
type HandleChannelHiddenParameters<SCG extends ExtendableGenerics> = BaseParameters<SCG> & RepeatedParameters<SCG>;
type HandleChannelVisibleParameters<SCG extends ExtendableGenerics> = BaseParameters<SCG> & RepeatedParameters<SCG> & Required<Pick<ChannelListProps<SCG>, 'sort' | 'filters'>>;
type HandleChannelTruncatedParameters<SCG extends ExtendableGenerics> = BaseParameters<SCG> & RepeatedParameters<SCG>;
type HandleChannelUpdatedParameters<SCG extends ExtendableGenerics> = BaseParameters<SCG> & RepeatedParameters<SCG>;
type HandleUserPresenceChangedParameters<SCG extends ExtendableGenerics> = BaseParameters<SCG>;
export declare const useChannelListShapeDefaults: <SCG extends ExtendableGenerics>() => {
    handleChannelDeleted: (p: HandleChannelDeletedParameters<SCG>) => void;
    handleChannelHidden: (p: HandleChannelHiddenParameters<SCG>) => void;
    handleChannelTruncated: ({ customHandler, event, setChannels }: HandleChannelTruncatedParameters<SCG>) => void;
    handleChannelUpdated: ({ customHandler, event, setChannels }: HandleChannelUpdatedParameters<SCG>) => void;
    handleChannelVisible: ({ customHandler, event, filters, setChannels, sort, }: HandleChannelVisibleParameters<SCG>) => Promise<void>;
    handleMemberUpdated: ({ event, filters, lockChannelOrder, setChannels, sort, }: HandleMemberUpdatedParameters<SCG>) => void;
    handleMessageNew: ({ allowNewMessagesFromUnfilteredChannels, customHandler, event, filters, lockChannelOrder, setChannels, sort, }: HandleMessageNewParameters<SCG>) => void;
    handleNotificationAddedToChannel: ({ allowNewMessagesFromUnfilteredChannels, customHandler, event, setChannels, sort, }: HandleNotificationAddedToChannelParameters<SCG>) => Promise<void>;
    handleNotificationMessageNew: ({ allowNewMessagesFromUnfilteredChannels, customHandler, event, filters, setChannels, sort, }: HandleNotificationMessageNewParameters<SCG>) => Promise<void>;
    handleNotificationRemovedFromChannel: ({ customHandler, event, setChannels, }: HandleNotificationRemovedFromChannelParameters<SCG>) => void;
    handleUserPresenceChanged: ({ event, setChannels }: HandleUserPresenceChangedParameters<SCG>) => void;
};
type UseDefaultHandleChannelListShapeParameters<SCG extends ExtendableGenerics> = Required<Pick<ChannelListProps<SCG>, 'allowNewMessagesFromUnfilteredChannels' | 'lockChannelOrder' | 'filters' | 'sort'>> & Pick<ChannelListProps<SCG>, 'onAddedToChannel' | 'onChannelDeleted' | 'onChannelHidden' | 'onChannelTruncated' | 'onChannelUpdated' | 'onChannelVisible' | 'onMessageNew' | 'onMessageNewHandler' | 'onRemovedFromChannel'> & {
    setChannels: SetChannels<SCG>;
    customHandleChannelListShape?: (data: {
        defaults: ReturnType<typeof useChannelListShapeDefaults>;
        event: Event<SCG>;
        setChannels: SetChannels<SCG>;
    }) => void;
};
export declare const usePrepareShapeHandlers: <SCG extends ExtendableGenerics>({ allowNewMessagesFromUnfilteredChannels, customHandleChannelListShape, filters, lockChannelOrder, onAddedToChannel, onChannelDeleted, onChannelHidden, onChannelTruncated, onChannelUpdated, onChannelVisible, onMessageNew, onMessageNewHandler, onRemovedFromChannel, setChannels, sort, }: UseDefaultHandleChannelListShapeParameters<SCG>) => {
    customHandler: ((e: Event<SCG>) => void) | null;
    defaultHandler: (e: Event<SCG>) => void;
};
export declare const useChannelListShape: <SCG extends ExtendableGenerics>(handler: (e: Event<SCG>) => void) => void;
export {};
