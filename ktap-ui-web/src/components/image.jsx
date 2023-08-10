import React from 'react';
import { useStyletron } from 'baseui';
import { MOBILE_BREAKPOINT } from '../constants';
import { Skeleton } from 'baseui/skeleton';

function Image({ src, alt, width = 'auto', height = 'auto', skeletonWidth = 'auto', skeletonHeight = 'auto', }) {
    const [css,] = useStyletron();
    const [loaded, setLoaded] = React.useState(false);
    return (
        <>
            {!loaded && (<Skeleton width={skeletonWidth} height={skeletonHeight} animation overrides={{
                Root: {
                    style: {
                        borderTopLeftRadius: 'inherit',
                        borderTopRightRadius: 'inherit',
                        borderBottomLeftRadius: 'inherit',
                        borderBottomRightRadius: 'inherit',
                        [MOBILE_BREAKPOINT]: {
                            height: '200px',
                        }
                    }
                }
            }} />)}
            <img className={
                css({
                    width: width, height: height, objectFit: 'cover',
                    borderTopLeftRadius: 'inherit',
                    borderTopRightRadius: 'inherit',
                    borderBottomLeftRadius: 'inherit',
                    borderBottomRightRadius: 'inherit',
                    display: loaded ? 'block' : 'none',
                })
            } onLoad={() => setLoaded(true)} src={src} alt={alt} />
        </>
    );
}

export default Image;