import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslationContext } from '../../../context';
import { MediaRecorderController, } from '../classes';
export const useMediaRecorder = ({ asyncMessagesMultiSendEnabled, enabled, generateRecordingTitle, handleSubmit, recordingConfig, uploadAttachment, }) => {
    const { t } = useTranslationContext('useMediaRecorder');
    const [recording, setRecording] = useState();
    const [recordingState, setRecordingState] = useState();
    const [permissionState, setPermissionState] = useState();
    const [isScheduledForSubmit, scheduleForSubmit] = useState(false);
    const recorder = useMemo(() => enabled
        ? new MediaRecorderController({
            config: recordingConfig ?? {},
            generateRecordingTitle,
            t,
        })
        : undefined, [recordingConfig, enabled, generateRecordingTitle, t]);
    const completeRecording = useCallback(async () => {
        if (!recorder)
            return;
        const recording = await recorder.stop();
        if (!recording)
            return;
        await uploadAttachment(recording);
        if (!asyncMessagesMultiSendEnabled) {
            // FIXME: cannot call handleSubmit() directly as the function has stale reference to attachments
            scheduleForSubmit(true);
        }
        recorder.cleanUp();
    }, [asyncMessagesMultiSendEnabled, recorder, uploadAttachment]);
    useEffect(() => {
        if (!isScheduledForSubmit)
            return;
        handleSubmit();
        scheduleForSubmit(false);
    }, [handleSubmit, isScheduledForSubmit]);
    useEffect(() => {
        if (!recorder)
            return;
        recorder.permission.watch();
        const recordingSubscription = recorder.recording.subscribe(setRecording);
        const recordingStateSubscription = recorder.recordingState.subscribe(setRecordingState);
        const permissionStateSubscription = recorder.permission.state.subscribe(setPermissionState);
        return () => {
            recorder.cancel();
            recorder.permission.unwatch();
            recordingSubscription.unsubscribe();
            recordingStateSubscription.unsubscribe();
            permissionStateSubscription.unsubscribe();
        };
    }, [recorder]);
    return {
        completeRecording,
        permissionState,
        recorder,
        recording,
        recordingState,
    };
};
