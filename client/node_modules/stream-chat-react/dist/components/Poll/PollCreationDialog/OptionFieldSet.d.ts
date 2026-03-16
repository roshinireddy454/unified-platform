import React from 'react';
import type { OptionErrors, PollFormState } from './types';
export type OptionFieldSetProps = {
    errors: OptionErrors;
    options: PollFormState['options'];
    setErrors: (fn: (prev: OptionErrors) => OptionErrors) => void;
    setState: (fn: (prev: PollFormState) => PollFormState) => void;
};
export declare const OptionFieldSet: ({ errors, options, setErrors, setState, }: OptionFieldSetProps) => React.JSX.Element;
