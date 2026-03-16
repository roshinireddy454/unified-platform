import React from 'react';
const UnMemoizedEmoticonItem = (props) => {
    const { entity } = props;
    const hasEntity = Object.keys(entity).length;
    const itemParts = entity?.itemNameParts;
    const renderName = () => {
        if (!hasEntity)
            return null;
        return (hasEntity &&
            itemParts.parts.map((part, i) => part.toLowerCase() === itemParts.match.toLowerCase() ? (React.createElement("span", { className: 'str-chat__emoji-item--highlight', key: `part-${i}` }, part)) : (React.createElement("span", { className: 'str-chat__emoji-item--part', key: `part-${i}` }, part))));
    };
    return (React.createElement("div", { className: 'str-chat__emoji-item' },
        React.createElement("span", { className: 'str-chat__emoji-item--entity' }, entity.native),
        React.createElement("span", { className: 'str-chat__emoji-item--name' }, renderName())));
};
export const EmoticonItem = React.memo(UnMemoizedEmoticonItem);
