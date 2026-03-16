import { Placement } from '@popperjs/core';
import React, { ComponentProps, PropsWithChildren } from 'react';
export interface DialogAnchorOptions {
    open: boolean;
    placement: Placement;
    referenceElement: HTMLElement | null;
}
export declare function useDialogAnchor<T extends HTMLElement>({ open, placement, referenceElement, }: DialogAnchorOptions): {
    attributes: {
        [key: string]: {
            [key: string]: string;
        } | undefined;
    };
    setPopperElement: React.Dispatch<React.SetStateAction<T | null>>;
    styles: {
        [key: string]: React.CSSProperties;
    };
};
export type DialogAnchorProps = PropsWithChildren<Partial<DialogAnchorOptions>> & {
    id: string;
    focus?: boolean;
    trapFocus?: boolean;
} & ComponentProps<'div'>;
export declare const DialogAnchor: ({ children, className, focus, id, placement, referenceElement, trapFocus, ...restDivProps }: DialogAnchorProps) => React.JSX.Element | null;
