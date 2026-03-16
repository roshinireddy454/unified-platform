import React, { PropsWithChildren } from 'react';
import { DialogManager } from '../components/Dialog/DialogManager';
type DialogManagerProviderContextValue = {
    dialogManager: DialogManager;
};
export declare const DialogManagerProvider: ({ children, id, }: PropsWithChildren<{
    id?: string;
}>) => React.JSX.Element;
export declare const useDialogManager: () => DialogManagerProviderContextValue;
export {};
