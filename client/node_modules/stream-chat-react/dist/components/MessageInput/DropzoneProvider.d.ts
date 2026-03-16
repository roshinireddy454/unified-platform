import React, { PropsWithChildren } from 'react';
import type { MessageInputProps } from './MessageInput';
import type { CustomTrigger, DefaultStreamChatGenerics } from '../../types/types';
export declare const DropzoneProvider: <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics, V extends CustomTrigger = CustomTrigger>(props: PropsWithChildren<MessageInputProps<StreamChatGenerics, V>>) => React.JSX.Element;
