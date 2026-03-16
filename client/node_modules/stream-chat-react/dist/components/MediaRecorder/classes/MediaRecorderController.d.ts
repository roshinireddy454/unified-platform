import { AmplitudeRecorder, AmplitudeRecorderConfig } from './AmplitudeRecorder';
import { BrowserPermission } from './BrowserPermission';
import { BehaviorSubject, Subject } from '../observable';
import { TranscoderConfig } from '../transcode';
import { RecordedMediaType } from '../../ReactFileUtilities';
import { TranslationContextValue } from '../../../context';
import type { LocalVoiceRecordingAttachment } from '../../MessageInput';
import type { DefaultStreamChatGenerics } from '../../../types';
export declare const RECORDED_MIME_TYPE_BY_BROWSER: {
    readonly audio: {
        readonly others: "audio/webm";
        readonly safari: "audio/mp4;codecs=mp4a.40.2";
    };
};
export declare const DEFAULT_AUDIO_TRANSCODER_CONFIG: TranscoderConfig;
type MediaRecorderConfig = Omit<MediaRecorderOptions, 'mimeType'> & Required<Pick<MediaRecorderOptions, 'mimeType'>>;
export type AudioRecorderConfig = {
    amplitudeRecorderConfig: AmplitudeRecorderConfig;
    mediaRecorderConfig: MediaRecorderOptions;
    transcoderConfig: TranscoderConfig;
};
type PartialValues<T> = {
    [P in keyof T]?: Partial<T[P]>;
};
export type CustomAudioRecordingConfig = PartialValues<AudioRecorderConfig>;
export type AudioRecorderOptions = {
    config?: CustomAudioRecordingConfig;
    generateRecordingTitle?: (mimeType: string) => string;
    t?: TranslationContextValue['t'];
};
export declare enum MediaRecordingState {
    PAUSED = "paused",
    RECORDING = "recording",
    STOPPED = "stopped"
}
export declare enum RecordingAttachmentType {
    VOICE_RECORDING = "voiceRecording"
}
export declare class MediaRecorderController<StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics> {
    permission: BrowserPermission;
    mediaRecorder: MediaRecorder | undefined;
    amplitudeRecorder: AmplitudeRecorder | undefined;
    amplitudeRecorderConfig: AmplitudeRecorderConfig;
    mediaRecorderConfig: MediaRecorderConfig;
    transcoderConfig: TranscoderConfig;
    startTime: number | undefined;
    recordedChunkDurations: number[];
    recordedData: Blob[];
    recordingUri: string | undefined;
    mediaType: RecordedMediaType;
    signalRecordingReady: ((r: LocalVoiceRecordingAttachment<StreamChatGenerics>) => void) | undefined;
    recordingState: BehaviorSubject<MediaRecordingState | undefined>;
    recording: BehaviorSubject<LocalVoiceRecordingAttachment<StreamChatGenerics> | undefined>;
    error: Subject<Error | undefined>;
    notification: Subject<{
        text: string;
        type: 'success' | 'error';
    } | undefined>;
    customGenerateRecordingTitle: ((mimeType: string) => string) | undefined;
    t: TranslationContextValue['t'];
    constructor({ config, generateRecordingTitle, t }?: AudioRecorderOptions);
    get durationMs(): number;
    generateRecordingTitle: (mimeType: string) => string;
    makeVoiceRecording: () => Promise<{
        asset_url: string;
        duration: number;
        file_size: number;
        localMetadata: {
            file: File;
            id: string;
        };
        mime_type: string;
        title: string;
        type: RecordingAttachmentType;
        waveform_data: number[];
    } | undefined>;
    handleErrorEvent: (e: Event) => void;
    handleDataavailableEvent: (e: BlobEvent) => Promise<void>;
    resetRecordingState: () => void;
    cleanUp: () => void;
    start: () => Promise<void>;
    pause: () => void;
    resume: () => void;
    stop: () => Promise<undefined> | Promise<LocalVoiceRecordingAttachment<StreamChatGenerics>>;
    cancel: () => void;
}
export {};
