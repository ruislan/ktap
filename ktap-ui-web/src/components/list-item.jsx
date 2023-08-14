import { useStyletron } from 'baseui';
import { Link } from 'react-router-dom';

function ListItem({ href, replace = false, children }) {
    const [css, theme] = useStyletron();
    return (
        <Link to={href} replace={replace} className={css({
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: theme.borders.radius300,
            padding: theme.sizing.scale300,
            minHeight: theme.sizing.scale1000,
            textDecoration: 'none',
            color: 'inherit',
            ':hover': {
                backgroundColor: theme.colors.backgroundTertiary,
            }
        })}>
            {children}
        </Link>
    );
}

export default ListItem;






