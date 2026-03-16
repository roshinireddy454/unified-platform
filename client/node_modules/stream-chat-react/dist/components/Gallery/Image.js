import React, { useState } from 'react';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { BaseImage as DefaultBaseImage } from './BaseImage';
import { Modal } from '../Modal';
import { ModalGallery as DefaultModalGallery } from './ModalGallery';
import { useComponentContext } from '../../context';
/**
 * A simple component that displays an image.
 */
export const ImageComponent = (props) => {
    const { dimensions = {}, fallback, image_url, innerRef, previewUrl, style, thumb_url, } = props;
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { BaseImage = DefaultBaseImage, ModalGallery = DefaultModalGallery } = useComponentContext('ImageComponent');
    const imageSrc = sanitizeUrl(previewUrl || image_url || thumb_url);
    const toggleModal = () => setModalIsOpen((modalIsOpen) => !modalIsOpen);
    return (React.createElement(React.Fragment, null,
        React.createElement(BaseImage, { alt: fallback, className: 'str-chat__message-attachment--img', "data-testid": 'image-test', onClick: toggleModal, src: imageSrc, style: style, tabIndex: 0, title: fallback, ...dimensions, ...(innerRef && { ref: innerRef }) }),
        React.createElement(Modal, { className: 'str-chat__image-modal', onClose: toggleModal, open: modalIsOpen },
            React.createElement(ModalGallery, { images: [props], index: 0 }))));
};
