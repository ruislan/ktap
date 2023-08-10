import React from 'react';
import { useStyletron } from 'baseui';
import { MOBILE_BREAKPOINT } from '../constants';
import { Link } from 'react-router-dom';

function Capsule({ href, children }) {
    const [css, theme] = useStyletron();
    return (
        <Link to={href} className={css({
            position: 'relative',
            display: 'flex',
            backgroundColor: theme.colors.backgroundSecondary,
            padding: theme.sizing.scale100,
            // marginBottom: theme.sizing.scale600,
            color: 'inherit',
            textDecoration: 'none',
            borderRadius: theme.borders.radius300,
            ':hover': {
                backgroundColor: theme.colors.backgroundTertiary,
            },
            [MOBILE_BREAKPOINT]: { padding: theme.sizing.scale0, }
        })}>
            {children}
        </Link>
    );
}

export default Capsule;
