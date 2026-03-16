import React, { PropsWithChildren } from 'react';
import { ComponentContextValue } from './ComponentContext';
export declare function WithComponents({ children, overrides, }: PropsWithChildren<{
    overrides: Partial<ComponentContextValue>;
}>): React.JSX.Element;
