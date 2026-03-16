import React, { ComponentProps } from 'react';
type FieldErrorProps = ComponentProps<'div'> & {
    text?: string;
};
export declare const FieldError: ({ className, text, ...props }: FieldErrorProps) => React.JSX.Element;
export {};
