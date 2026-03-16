import React, { createContext, useContext } from 'react';
import { Channel } from '../../components';
export const ThreadContext = createContext(undefined);
export const useThreadContext = () => {
    const thread = useContext(ThreadContext);
    return thread ?? undefined;
};
export const ThreadProvider = ({ children, thread, }) => (React.createElement(ThreadContext.Provider, { value: thread },
    React.createElement(Channel, { channel: thread?.channel }, children)));
