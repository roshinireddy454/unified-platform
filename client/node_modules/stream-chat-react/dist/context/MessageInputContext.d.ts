import React, { PropsWithChildren } from 'react';
import type { TriggerSettings } from '../components/MessageInput/DefaultTriggerProvider';
import type { CooldownTimerState, MessageInputProps } from '../components/MessageInput';
import type { CommandsListState, MentionsListState, MessageInputHookProps, MessageInputState } from '../components/MessageInput/hooks/useMessageInputState';
import type { CustomTrigger, DefaultStreamChatGenerics } from '../types/types';
export type MessageInputContextValue<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, V extends CustomTrigger = CustomTrigger> = MessageInputState<StreamChatGenerics> & MessageInputHookProps<StreamChatGenerics> & Omit<MessageInputProps<StreamChatGenerics, V>, 'Input'> & CooldownTimerState & {
    autocompleteTriggers?: TriggerSettings<StreamChatGenerics, V>;
} & CommandsListState & MentionsListState;
export declare const MessageInputContext: React.Context<(MessageInputState & import("../components/MessageInput/hooks/useLinkPreviews").EnrichURLsController & {
    handleChange: React.ChangeEventHandler<HTMLTextAreaElement>;
    handleSubmit: (event?: React.BaseSyntheticEvent<object, any, any> | undefined, customMessageData?: Partial<import("stream-chat").Message<DefaultStreamChatGenerics>> | undefined, options?: import("../types/types").SendMessageOptions | undefined) => void;
    insertText: (textToInsert: string) => void;
    isUploadEnabled: boolean;
    maxFilesLeft: number;
    numberOfUploads: number;
    onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
    onSelectUser: (item: import("stream-chat").UserResponse<DefaultStreamChatGenerics>) => void;
    recordingController: import("..").RecordingController<DefaultStreamChatGenerics>;
    removeAttachments: (ids: string[]) => void;
    textareaRef: React.MutableRefObject<HTMLTextAreaElement | null | undefined>;
    uploadAttachment: (attachment: import("../components/MessageInput").LocalAttachment<DefaultStreamChatGenerics>) => Promise<import("../components/MessageInput").LocalAttachment<DefaultStreamChatGenerics> | undefined>;
    uploadNewFiles: (files: FileList | File[]) => void;
    upsertAttachments: (attachments: (import("../components/MessageInput").LocalAttachment<DefaultStreamChatGenerics> | import("stream-chat").Attachment<DefaultStreamChatGenerics>)[]) => void;
}) | undefined>;
export declare const MessageInputContextProvider: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, V extends CustomTrigger = CustomTrigger>({ children, value, }: PropsWithChildren<{
    value: MessageInputContextValue<StreamChatGenerics, V>;
}>) => React.JSX.Element;
export declare const useMessageInputContext: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, V extends CustomTrigger = CustomTrigger>(componentName?: string) => MessageInputContextValue<StreamChatGenerics, V>;
