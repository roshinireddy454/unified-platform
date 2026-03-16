import { useCallback, useEffect } from 'react';
import { useDialogManager } from '../../../context';
import { useStateStore } from '../../../store';
export const useDialog = ({ id }) => {
    const { dialogManager } = useDialogManager();
    useEffect(() => () => {
        // Since this cleanup can run even if the component is still mounted
        // and dialog id is unchanged (e.g. in <StrictMode />), it's safer to
        // mark state as unused and only remove it after a timeout, rather than
        // to remove it immediately.
        dialogManager.markForRemoval(id);
    }, [dialogManager, id]);
    return dialogManager.getOrCreate({ id });
};
export const useDialogIsOpen = (id) => {
    const { dialogManager } = useDialogManager();
    const dialogIsOpenSelector = useCallback(({ dialogsById }) => ({ isOpen: !!dialogsById[id]?.isOpen }), [id]);
    return useStateStore(dialogManager.state, dialogIsOpenSelector).isOpen;
};
const openedDialogCountSelector = (nextValue) => ({
    openedDialogCount: Object.values(nextValue.dialogsById).reduce((count, dialog) => {
        if (dialog.isOpen)
            return count + 1;
        return count;
    }, 0),
});
export const useOpenedDialogCount = () => {
    const { dialogManager } = useDialogManager();
    return useStateStore(dialogManager.state, openedDialogCountSelector).openedDialogCount;
};
