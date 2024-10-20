import React from 'react';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import { useStyletron } from 'baseui';

function ImageBoxGallery({ id, images }) {
    const [css, theme] = useStyletron();
    React.useEffect(() => {
        let lightbox = new PhotoSwipeLightbox({
            gallery: '#' + id,
            children: 'a',
            mouseMovePan: true,
            spacing: 0.1,
            pswpModule: () => import('photoswipe'),
        });
        lightbox.init();

        // set it's original size
        document.querySelectorAll(`#${id} a`).forEach((a) => {
            const img = a.querySelector('img');
            img.onload = function () {
                a.setAttribute('data-pswp-width', img.naturalWidth);
                a.setAttribute('data-pswp-height', img.naturalHeight);
            }
        });

        return () => {
            lightbox.destroy();
            lightbox = null;
        };
    }, [id]);

    return (
        <div className={css({ display: 'flex', alignItems: 'baseline' })} id={id}>
            {images.map((image, index) => (
                <a href={image.url} key={id + '-' + index} target="_blank" rel="noreferrer"
                    className={css({ marginRight: theme.sizing.scale100 })}>
                    <img width='100px' src={image.url} />
                </a>
            ))}
        </div>
    );
}

export default ImageBoxGallery;






