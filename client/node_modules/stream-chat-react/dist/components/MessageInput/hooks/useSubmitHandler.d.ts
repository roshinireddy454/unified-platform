import type { Message } from 'stream-chat';
import type { MessageInputReducerAction, MessageInputState } from './useMessageInputState';
import type { MessageInputProps } from '../MessageInput';
import type { CustomTrigger, DefaultStreamChatGenerics, SendMessageOptions } from '../../../types/types';
import type { EnrichURLsController } from './useLinkPreviews';
export declare const useSubmitHandler: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, V extends CustomTrigger = CustomTrigger>(props: MessageInputProps<StreamChatGenerics, V>, state: MessageInputState<StreamChatGenerics>, dispatch: React.Dispatch<MessageInputReducerAction<StreamChatGenerics>>, numberOfUploads: number, enrichURLsController: EnrichURLsController) => {
    handleSubmit: (event?: React.BaseSyntheticEvent, customMessageData?: Partial<Message<StreamChatGenerics>>, options?: SendMessageOptions) => Promise<void>;
};
