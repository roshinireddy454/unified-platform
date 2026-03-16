import React from 'react';
import type { PollFormState } from './types';
export type PollCreationDialogControlsProps = {
    close: () => void;
    errors: string[];
    state: PollFormState;
};
export declare const PollCreationDialogControls: ({ close, errors, state, }: PollCreationDialogControlsProps) => React.JSX.Element;
