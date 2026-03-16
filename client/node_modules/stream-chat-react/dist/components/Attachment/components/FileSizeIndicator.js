import React from 'react';
import { prettifyFileSize } from '../../MessageInput/hooks/utils';
export const FileSizeIndicator = ({ fileSize, maximumFractionDigits, }) => {
    if (!(fileSize && Number.isFinite(Number(fileSize))))
        return null;
    return (React.createElement("span", { className: 'str-chat__message-attachment-file--item-size', "data-testid": 'file-size-indicator' }, prettifyFileSize(fileSize, maximumFractionDigits)));
};
