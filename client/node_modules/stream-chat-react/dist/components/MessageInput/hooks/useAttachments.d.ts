import type { FileLike } from '../../ReactFileUtilities';
import type { Attachment } from 'stream-chat';
import type { MessageInputReducerAction, MessageInputState } from './useMessageInputState';
import type { MessageInputProps } from '../MessageInput';
import type { LocalAttachment } from '../types';
import type { CustomTrigger, DefaultStreamChatGenerics } from '../../../types/types';
export declare const useAttachments: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, V extends CustomTrigger = CustomTrigger>(props: MessageInputProps<StreamChatGenerics, V>, state: MessageInputState<StreamChatGenerics>, dispatch: React.Dispatch<MessageInputReducerAction<StreamChatGenerics>>, textareaRef: React.MutableRefObject<HTMLTextAreaElement | undefined>) => {
    maxFilesLeft: number;
    numberOfUploads: number;
    removeAttachments: (ids: string[]) => void;
    uploadAttachment: (att: LocalAttachment<StreamChatGenerics>) => Promise<LocalAttachment<StreamChatGenerics> | undefined>;
    uploadNewFiles: (files: FileList | File[] | FileLike[]) => void;
    upsertAttachments: (attachments: (Attachment<StreamChatGenerics> | LocalAttachment<StreamChatGenerics>)[]) => void;
};
