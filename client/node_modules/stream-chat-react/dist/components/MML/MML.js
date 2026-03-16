import React, { Suspense } from 'react';
import { useChatContext } from '../../context/ChatContext';
const MMLReact = React.lazy(async () => {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const mml = await import('mml-react');
    return { default: mml.MML };
});
/**
 * A wrapper component around MML-React library
 */
export const MML = (props) => {
    const { actionHandler, align = 'right', source } = props;
    const { theme } = useChatContext('MML');
    return (React.createElement(Suspense, { fallback: null },
        React.createElement(MMLReact, { className: `mml-align-${align}`, Loading: null, onSubmit: actionHandler, source: source, Success: null, theme: (theme || '').replace(' ', '-') })));
};
