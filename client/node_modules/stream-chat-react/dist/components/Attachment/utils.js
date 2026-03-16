export const SUPPORTED_VIDEO_FORMATS = [
    'video/mp4',
    'video/ogg',
    'video/webm',
    'video/quicktime',
];
export const isLocalAttachment = (attachment) => !!attachment.localMetadata?.id;
export const isScrapedContent = (attachment) => attachment.og_scrape_url || attachment.title_link;
export const isUploadedImage = (attachment) => attachment.type === 'image' && !isScrapedContent(attachment);
export const isLocalImageAttachment = (attachment) => isUploadedImage(attachment) && isLocalAttachment(attachment);
export const isGalleryAttachmentType = (output) => Array.isArray(output.images);
export const isAudioAttachment = (attachment) => attachment.type === 'audio';
export const isLocalAudioAttachment = (attachment) => isAudioAttachment(attachment) && isLocalAttachment(attachment);
export const isVoiceRecordingAttachment = (attachment) => attachment.type === 'voiceRecording';
export const isLocalVoiceRecordingAttachment = (attachment) => isVoiceRecordingAttachment(attachment) && isLocalAttachment(attachment);
export const isFileAttachment = (attachment) => attachment.type === 'file' ||
    !!(attachment.mime_type &&
        SUPPORTED_VIDEO_FORMATS.indexOf(attachment.mime_type) === -1 &&
        attachment.type !== 'video');
export const isLocalFileAttachment = (attachment) => isFileAttachment(attachment) && isLocalAttachment(attachment);
export const isMediaAttachment = (attachment) => (attachment.mime_type &&
    SUPPORTED_VIDEO_FORMATS.indexOf(attachment.mime_type) !== -1) ||
    attachment.type === 'video';
export const isLocalMediaAttachment = (attachment) => isMediaAttachment(attachment) && isLocalAttachment(attachment);
export const isSvgAttachment = (attachment) => {
    const filename = attachment.fallback || '';
    return filename.toLowerCase().endsWith('.svg');
};
export const divMod = (num, divisor) => [
    Math.floor(num / divisor),
    num % divisor,
];
export const displayDuration = (totalSeconds) => {
    if (!totalSeconds || totalSeconds < 0)
        return '00:00';
    const [hours, hoursLeftover] = divMod(totalSeconds, 3600);
    const [minutes, seconds] = divMod(hoursLeftover, 60);
    const roundedSeconds = Math.ceil(seconds);
    const prependHrsZero = hours.toString().length === 1 ? '0' : '';
    const prependMinZero = minutes.toString().length === 1 ? '0' : '';
    const prependSecZero = roundedSeconds.toString().length === 1 ? '0' : '';
    const minSec = `${prependMinZero}${minutes}:${prependSecZero}${roundedSeconds}`;
    return hours ? `${prependHrsZero}${hours}:` + minSec : minSec;
};
