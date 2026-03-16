import type { GetOrCreateDialogParams } from '../DialogManager';
export declare const useDialog: ({ id }: GetOrCreateDialogParams) => import("../DialogManager").Dialog;
export declare const useDialogIsOpen: (id: string) => boolean;
export declare const useOpenedDialogCount: () => number;
