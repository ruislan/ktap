import { useStyletron } from 'baseui';

const SplitBall = function ({ color = 'inherit', gap = '4px', }) {
    const [css, theme] = useStyletron();
    return (
        <div className={css({
            borderRadius: '50%', marginLeft: gap, marginRight: gap, backgroundColor: color,
            width: theme.sizing.scale100, height: theme.sizing.scale100,
        })}></div>
    );
}

export default SplitBall;






