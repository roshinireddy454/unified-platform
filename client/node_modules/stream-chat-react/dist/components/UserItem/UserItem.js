import React from 'react';
import clsx from 'clsx';
import { Avatar as DefaultAvatar } from '../Avatar';
/**
 * UI component for mentions rendered in suggestion list
 */
const UnMemoizedUserItem = ({ Avatar = DefaultAvatar, entity }) => {
    const hasEntity = !!Object.keys(entity).length;
    const itemParts = entity?.itemNameParts;
    const renderName = () => {
        if (!hasEntity)
            return null;
        return itemParts.parts.map((part, i) => {
            const matches = part.toLowerCase() === itemParts.match.toLowerCase();
            return (React.createElement("span", { className: clsx({
                    'str-chat__emoji-item--highlight': matches,
                    'str-chat__emoji-item--part': !matches,
                }), key: `part-${i}` }, part));
        });
    };
    return (React.createElement("div", { className: 'str-chat__user-item' },
        React.createElement(Avatar, { className: 'str-chat__avatar--autocomplete-item', image: entity.image, name: entity.name || entity.id }),
        React.createElement("span", { className: 'str-chat__user-item--name', "data-testid": 'user-item-name' }, renderName()),
        React.createElement("div", { className: 'str-chat__user-item-at' }, "@")));
};
export const UserItem = React.memo(UnMemoizedUserItem);
