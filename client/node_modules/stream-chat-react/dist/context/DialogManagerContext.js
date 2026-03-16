import React, { useContext, useState } from 'react';
import { DialogManager } from '../components/Dialog/DialogManager';
import { DialogPortalDestination } from '../components/Dialog/DialogPortal';
const DialogManagerProviderContext = React.createContext(undefined);
export const DialogManagerProvider = ({ children, id, }) => {
    const [dialogManager] = useState(() => new DialogManager({ id }));
    return (React.createElement(DialogManagerProviderContext.Provider, { value: { dialogManager } },
        children,
        React.createElement(DialogPortalDestination, null)));
};
export const useDialogManager = () => {
    const value = useContext(DialogManagerProviderContext);
    return value;
};
