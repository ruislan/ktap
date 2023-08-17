import React from 'react';

export function useOutsideClick({ ref, handler }) {
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (ref?.current) {
                if (!ref.current.contains(event.target)) {
                    handler();
                }
            }
        }
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [ref, handler]);
}