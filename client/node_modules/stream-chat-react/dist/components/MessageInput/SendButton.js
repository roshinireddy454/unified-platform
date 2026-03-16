import React from 'react';
import { SendIcon } from './icons';
export const SendButton = ({ sendMessage, ...rest }) => (React.createElement("button", { "aria-label": 'Send', className: 'str-chat__send-button', "data-testid": 'send-button', onClick: sendMessage, type: 'button', ...rest },
    React.createElement(SendIcon, null)));
