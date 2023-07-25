import React from 'react';
import { useStyletron } from 'baseui';

function RoundTab({ activeKey, names, onChange }) {
    const [css, theme] = useStyletron();
    const btnRefs = React.useRef([]);
    const bgRef = React.useRef(null);

    React.useEffect(() => {
        if (btnRefs.current[activeKey]) {
            const { offsetLeft, offsetWidth, offsetHeight } = btnRefs.current[activeKey];
            bgRef.current.style.width = `${offsetWidth}px`;
            bgRef.current.style.height = `${offsetHeight}px`;
            bgRef.current.style.transform = `translateX(${offsetLeft - 4}px)`;
        }
    }, [activeKey]);

    return (
        <div className={css({
            display: 'flex', alignItems: 'center', width: '100%',
            borderRadius: theme.borders.radius300, padding: theme.sizing.scale100,
            overflow: 'auto', backgroundColor: 'rgb(41,41,41)',
            whiteSpace: 'nowrap', position: 'relative',
        })}>
            {names.map((name, index) => (
                <button key={index} ref={el => btnRefs.current[index] = el} className={css({
                    display: 'inline-block', margin: '0px', border: 'none', outline: 'none', appearance: 'none', position: 'relative',
                    zIndex: 2,
                    paddingLeft: theme.sizing.scale500, paddingRight: theme.sizing.scale500,
                    paddingTop: theme.sizing.scale400, paddingBottom: theme.sizing.scale400,
                    fontSize: theme.typography.LabelSmall.fontSize, fontFamily: theme.typography.LabelSmall.fontFamily,
                    fontWeight: theme.typography.LabelSmall.fontWeight, lineHeight: theme.typography.LabelSmall.lineHeight,
                    color: activeKey === index ? theme.colors.primary : theme.colors.primary400, cursor: 'pointer',
                    backgroundColor: 'transparent',
                    boxShadow: activeKey === index ? theme.lighting.shadow400 : 'none',
                    ':hover': {
                        color: theme.colors.primary,
                    }
                })} onClick={(e) => {
                    e.activeKey = index;
                    onChange(e);
                }}>
                    {name}
                </button>
            ))}
            <div ref={bgRef} className={css({
                backgroundColor: theme.colors.backgroundPrimary, borderRadius: theme.borders.radius300, position: 'absolute',
                transitionTimingFunction: theme.animation.easeInOutCurve, transitionDuration: theme.animation.timing300,
                zIndex: 1,
            })}></div>
        </div>
    );
}

export default RoundTab;






