import React, { useCallback } from 'react';
import clsx from 'clsx';
export const Item = React.forwardRef(function Item(props, innerRef) {
    const { className, component: Component, item, onClickHandler, onSelectHandler, selected, style, } = props;
    const handleSelect = useCallback(() => onSelectHandler(item), [item, onSelectHandler]);
    const handleClick = useCallback((event) => onClickHandler(event, item), [item, onClickHandler]);
    return (React.createElement("li", { className: clsx(className, { 'str-chat__suggestion-item--selected': selected }), style: style },
        React.createElement("a", { href: '', onClick: handleClick, onFocus: handleSelect, onMouseEnter: handleSelect, ref: innerRef },
            React.createElement(Component, { entity: item, selected: selected }))));
});
