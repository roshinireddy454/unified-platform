import React from 'react';
import { EnrichURLsController } from './useLinkPreviews';
import { RecordingController } from '../../MediaRecorder/hooks/useMediaRecorder';
import type { LinkPreviewMap, LocalAttachment } from '../types';
import { SetLinkPreviewMode } from '../types';
import type { Attachment, Message, UserResponse } from 'stream-chat';
import type { MessageInputProps } from '../MessageInput';
import type { CustomTrigger, DefaultStreamChatGenerics, SendMessageOptions } from '../../../types/types';
export type MessageInputState<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    attachments: LocalAttachment<StreamChatGenerics>[];
    linkPreviews: LinkPreviewMap;
    mentioned_users: UserResponse<StreamChatGenerics>[];
    setText: (text: string) => void;
    text: string;
};
type UpsertAttachmentsAction<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    attachments: LocalAttachment<StreamChatGenerics>[];
    type: 'upsertAttachments';
};
type RemoveAttachmentsAction = {
    ids: string[];
    type: 'removeAttachments';
};
type SetTextAction = {
    getNewText: (currentStateText: string) => string;
    type: 'setText';
};
type ClearAction = {
    type: 'clear';
};
type SetLinkPreviewsAction = {
    linkPreviews: LinkPreviewMap;
    mode: SetLinkPreviewMode;
    type: 'setLinkPreviews';
};
type AddMentionedUserAction<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    type: 'addMentionedUser';
    user: UserResponse<StreamChatGenerics>;
};
export type MessageInputReducerAction<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = SetTextAction | ClearAction | SetLinkPreviewsAction | AddMentionedUserAction<StreamChatGenerics> | UpsertAttachmentsAction | RemoveAttachmentsAction;
export type MessageInputHookProps<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = EnrichURLsController & {
    handleChange: React.ChangeEventHandler<HTMLTextAreaElement>;
    handleSubmit: (event?: React.BaseSyntheticEvent, customMessageData?: Partial<Message<StreamChatGenerics>>, options?: SendMessageOptions) => void;
    insertText: (textToInsert: string) => void;
    isUploadEnabled: boolean;
    maxFilesLeft: number;
    numberOfUploads: number;
    onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
    onSelectUser: (item: UserResponse<StreamChatGenerics>) => void;
    recordingController: RecordingController<StreamChatGenerics>;
    removeAttachments: (ids: string[]) => void;
    textareaRef: React.MutableRefObject<HTMLTextAreaElement | null | undefined>;
    uploadAttachment: (attachment: LocalAttachment<StreamChatGenerics>) => Promise<LocalAttachment<StreamChatGenerics> | undefined>;
    uploadNewFiles: (files: FileList | File[]) => void;
    upsertAttachments: (attachments: (Attachment<StreamChatGenerics> | LocalAttachment<StreamChatGenerics>)[]) => void;
};
export type CommandsListState = {
    closeCommandsList: () => void;
    openCommandsList: () => void;
    showCommandsList: boolean;
};
export type MentionsListState = {
    closeMentionsList: () => void;
    openMentionsList: () => void;
    showMentionsList: boolean;
};
/**
 * hook for MessageInput state
 */
export declare const useMessageInputState: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, V extends CustomTrigger = CustomTrigger>(props: MessageInputProps<StreamChatGenerics, V>) => MessageInputState<StreamChatGenerics> & MessageInputHookProps<StreamChatGenerics> & CommandsListState & MentionsListState;
export {};
