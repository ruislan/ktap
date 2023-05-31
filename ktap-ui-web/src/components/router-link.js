import React from 'react';

import { Link, NavLink } from 'react-router-dom';
import { useStyletron } from 'baseui';

// 封装了Router的Link和NavLink
/**
 * @param kind none or underline, default is none,
 * @param role Link/NavLink/a, default is Link,Link 和 NavLink 只能站内导航，a可以站外导航
 * @returns
 */
function RouterLink({ href, target, kind = 'none', role = 'Link', children }) {
    const [css, theme] = useStyletron();
    const style = { color: 'inherit', };
    if (kind === 'none') style.textDecoration = 'none';
    if (kind === 'underline') {
        style.textDecoration = 'underline';
        style.textUnderlineOffset = theme.sizing.scale100;
    }
    switch (role) {
        case 'Link': return <Link to={href} target={target} className={css(style)}>{children}</Link>;
        case 'NavLink': return <NavLink to={href} target={target} className={css(style)}>{children}</NavLink>;
        case 'a': return <a href={href} target={target} className={css(style)}>{children}</a>;
        default: return <></>;
    }
}

export default RouterLink;






