import { useStyletron } from 'baseui';

const Tag = function ({ startEnhancer, endEnhancer, closeable, onCloseClick, onClick, children }) {
    const [css, theme] = useStyletron();
    return (
        <div className={(css({
            display: 'inline-flex',
            whiteSpace: 'nowrap',
            alignItems: 'center',
            gap: theme.sizing.scale100,
            borderRadius: theme.borders.radius200,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            paddingTop: theme.sizing.scale100, paddingBottom: theme.sizing.scale100,
            paddingLeft: theme.sizing.scale300, paddingRight: theme.sizing.scale300,
            fontSize: theme.typography.LabelSmall.fontSize,
            fontFamily: theme.typography.LabelSmall.fontFamily,
            lineHeight: theme.typography.LabelSmall.lineHeight,
            color: theme.colors.contentSecondary,
            fontWeight: 400,
            cursor: onClick ? 'pointer' : 'default',
            ':hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: theme.colors.contentPrimary,
            }
        }))} onClick={onClick}>
            {startEnhancer && typeof (startEnhancer) === 'function' && startEnhancer()}
            {children}
            {endEnhancer && typeof (endEnhancer) === 'function' && endEnhancer()}
            {closeable && <span className={(css({
                display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
            }))} onClick={onCloseClick}>
                <svg xmlns='http://www.w3.org/2000/svg' focusable={false} aria-hidden fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' width='16' height='16'>
                    <title>Delete</title>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                </svg>
            </span>}
        </div>
    )
}

export default Tag;