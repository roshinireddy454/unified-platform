import clsx from 'clsx';
import { MAX_POLL_OPTIONS } from '../constants';
import { nanoid } from 'nanoid';
import React, { useCallback } from 'react';
import { FieldError } from '../../Form/FieldError';
import { DragAndDropContainer } from '../../DragAndDrop/DragAndDropContainer';
import { useTranslationContext } from '../../../context';
const VALIDATION_ERRORS = { 'Option already exists': true };
export const OptionFieldSet = ({ errors, options, setErrors, setState, }) => {
    const { t } = useTranslationContext('OptionFieldSet');
    const findOptionDuplicate = (sourceOption) => {
        const isDuplicateFilter = (option) => !!sourceOption.text.trim() && // do not include empty options into consideration
            option.id !== sourceOption.id &&
            option.text.trim() === sourceOption.text.trim();
        return options.find(isDuplicateFilter);
    };
    const onSetNewOrder = useCallback((newOrder) => {
        setState((prev) => ({
            ...prev,
            options: newOrder.map((index) => prev.options[index]),
        }));
    }, [setState]);
    const draggable = options.length > 1;
    return (React.createElement("fieldset", { className: 'str-chat__form__field str-chat__form__input-fieldset' },
        React.createElement("legend", { className: 'str-chat__form__field-label' }, t('Options')),
        React.createElement(DragAndDropContainer, { className: 'str-chat__form__input-fieldset__values', draggable: draggable, onSetNewOrder: onSetNewOrder }, options.map((option, i) => (React.createElement("div", { className: clsx('str-chat__form__input-field', {
                'str-chat__form__input-field--draggable': draggable,
                'str-chat__form__input-field--has-error': errors[option.id],
            }), key: `new-poll-option-${i}` },
            React.createElement("div", { className: 'str-chat__form__input-field__value' },
                React.createElement(FieldError, { className: 'str-chat__form__input-field__error', "data-testid": 'poll-option-input-field-error', text: errors[option.id] }),
                React.createElement("input", { id: option.id, onBlur: (e) => {
                        if (findOptionDuplicate({ id: e.target.id, text: e.target.value })) {
                            setErrors((prev) => ({
                                ...prev,
                                [e.target.id]: t('Option already exists'),
                            }));
                        }
                    }, onChange: (e) => {
                        setState((prev) => {
                            const shouldAddEmptyOption = prev.options.length < MAX_POLL_OPTIONS &&
                                (!prev.options ||
                                    (prev.options.slice(i + 1).length === 0 && !!e.target.value));
                            const shouldRemoveOption = prev.options &&
                                prev.options.slice(i + 1).length > 0 &&
                                !e.target.value;
                            const optionListHead = prev.options ? prev.options.slice(0, i) : [];
                            const optionListTail = shouldAddEmptyOption
                                ? [{ id: nanoid(), text: '' }]
                                : (prev.options || []).slice(i + 1);
                            if ((errors[option.id] && !e.target.value) ||
                                (VALIDATION_ERRORS[errors[option.id]] &&
                                    !findOptionDuplicate({ id: e.target.id, text: e.target.value }))) {
                                setErrors((prev) => {
                                    delete prev[option.id];
                                    return prev;
                                });
                            }
                            return {
                                ...prev,
                                options: [
                                    ...optionListHead,
                                    ...(shouldRemoveOption
                                        ? []
                                        : [{ ...option, text: e.target.value }]),
                                    ...optionListTail,
                                ],
                            };
                        });
                    }, onKeyUp: (event) => {
                        if (event.key === 'Enter') {
                            const nextInputId = options[i + 1].id;
                            document.getElementById(nextInputId)?.focus();
                        }
                    }, placeholder: t('Add an option'), type: 'text', value: option.text })),
            draggable && React.createElement("div", { className: 'str-chat__drag-handle' })))))));
};
