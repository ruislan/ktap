import { useStyletron } from 'baseui';

export default function ActionButton({ color, ...rest }) {
    const [css, theme] = useStyletron();
    return (
        <div className={css({
            color, background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: theme.sizing.scale800, width: theme.sizing.scale800,
        })} {...rest} />
    );
}