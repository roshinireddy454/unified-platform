import { useMemo } from 'react';
import { getReadStates } from '../utils';
export const useLastReadData = (props) => {
    const { messages, read, returnAllReadData, userID } = props;
    return useMemo(() => getReadStates(messages.filter(({ user }) => user?.id === userID), read, returnAllReadData), [messages, read, returnAllReadData, userID]);
};
