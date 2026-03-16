import { MessageInputContextValue } from '../../../context';
import { CustomAudioRecordingConfig, MediaRecorderController, MediaRecordingState } from '../classes';
import type { LocalVoiceRecordingAttachment } from '../../MessageInput';
import type { DefaultStreamChatGenerics } from '../../../types';
export type RecordingController<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = {
    completeRecording: () => void;
    permissionState?: PermissionState;
    recorder?: MediaRecorderController;
    recording?: LocalVoiceRecordingAttachment<StreamChatGenerics>;
    recordingState?: MediaRecordingState;
};
type UseMediaRecorderParams<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> = Pick<MessageInputContextValue<StreamChatGenerics>, 'asyncMessagesMultiSendEnabled' | 'handleSubmit' | 'uploadAttachment'> & {
    enabled: boolean;
    generateRecordingTitle?: (mimeType: string) => string;
    recordingConfig?: CustomAudioRecordingConfig;
};
export declare const useMediaRecorder: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>({ asyncMessagesMultiSendEnabled, enabled, generateRecordingTitle, handleSubmit, recordingConfig, uploadAttachment, }: UseMediaRecorderParams<StreamChatGenerics>) => RecordingController<StreamChatGenerics>;
export {};
