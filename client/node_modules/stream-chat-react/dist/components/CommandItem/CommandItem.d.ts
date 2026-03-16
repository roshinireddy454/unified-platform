import React, { PropsWithChildren } from 'react';
export type CommandItemProps = {
    entity: {
        /** Arguments of command */
        args?: string;
        /** Description of command */
        description?: string;
        /** Name of the command */
        name?: string;
    };
};
export declare const CommandItem: (props: PropsWithChildren<CommandItemProps>) => React.JSX.Element;
