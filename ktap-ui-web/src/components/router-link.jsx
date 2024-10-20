import { Link, NavLink } from 'react-router-dom';
import { useStyletron } from 'baseui';

export default function RouterLink({ href, target, kind = 'none', role = 'Link', children }) {
    const [css, theme] = useStyletron();
    const style = { color: 'inherit' };
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






