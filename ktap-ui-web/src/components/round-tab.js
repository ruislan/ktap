import React from 'react';
import { useStyletron } from 'baseui';

const TabButton = React.memo(({ isActive, onPointerDown, ...props }) => {
    const [css, theme] = useStyletron();
    return (
        <button className={css({
            display: 'inline-block', margin: '0px', border: 'none', outline: 'none', appearance: 'none', position: 'relative',
            zIndex: 2, backgroundColor: 'transparent', backgroundImage: 'none',
            paddingLeft: theme.sizing.scale500, paddingRight: theme.sizing.scale500,
            paddingTop: theme.sizing.scale400, paddingBottom: theme.sizing.scale400,
            fontSize: theme.typography.LabelSmall.fontSize, fontFamily: theme.typography.LabelSmall.fontFamily,
            fontWeight: theme.typography.LabelSmall.fontWeight, lineHeight: theme.typography.LabelSmall.lineHeight,
            color: isActive ? theme.colors.primary : theme.colors.primary400, cursor: 'pointer',
            boxShadow: isActive ? theme.lighting.shadow400 : 'none',
            ':hover': { color: theme.colors.primary, }
        })} onPointerDown={onPointerDown} {...props} />
    );
});

const TabBg = React.memo(() => {
    const [css, theme] = useStyletron();
    return (
        <div className={css({
            backgroundColor: 'rgb(71,71,71)', borderRadius: theme.borders.radius300, position: 'absolute',
            transition: 'all cubic-bezier(0.4, 0, 0.2, 1) .25s', zIndex: 1,
        })} />
    );
});

export default function RoundTab({ activeKey, names, onChange }) {
    const [css, theme] = useStyletron();
    const ref = React.useRef(null);

    React.useEffect(() => {
        if (ref.current) {
            const tab = ref.current.children[activeKey];
            const bg = ref.current.lastElementChild;
            if (tab && bg) {
                bg.style.width = `${tab.offsetWidth}px`;
                bg.style.height = `${tab.offsetHeight}px`;
                bg.style.transform = `translate3d(${tab.offsetLeft - 6}px, 0, 0)`;
            }
        }
    }, [activeKey]);

    return (
        <div ref={ref} className={css({
            display: 'flex', alignItems: 'center', width: '100%',
            borderRadius: theme.borders.radius300, padding: theme.sizing.scale200,
            overflow: 'auto', backgroundColor: 'rgb(41,41,41)',
            whiteSpace: 'nowrap', position: 'relative',
        })}>
            {names.map((name, index) => (
                <TabButton key={index} isActive={activeKey === index} onPointerDown={(e) => {
                    e.activeKey = index;
                    onChange(e);
                }}>
                    {name}
                </TabButton>
            ))}
            <TabBg />
        </div>
    );
}
