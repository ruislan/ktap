import React from 'react';
import { useStyletron } from 'baseui';

const TabButton = function ({ isActive, onPointerDown, children }) {
    const [css, theme] = useStyletron();
    const [isPending, startTransition] = React.useTransition();
    return (
        <button
            className={css({
                display: 'inline-block', margin: '0px', border: 'none', outline: 'none', appearance: 'none', position: 'relative',
                zIndex: 2, backgroundColor: 'transparent', backgroundImage: 'none',
                paddingLeft: theme.sizing.scale500, paddingRight: theme.sizing.scale500,
                paddingTop: theme.sizing.scale400, paddingBottom: theme.sizing.scale400,
                fontSize: theme.typography.LabelSmall.fontSize, fontFamily: theme.typography.LabelSmall.fontFamily,
                fontWeight: theme.typography.LabelSmall.fontWeight, lineHeight: theme.typography.LabelSmall.lineHeight,
                color: isActive || isPending ? theme.colors.primary : theme.colors.primary400, cursor: 'pointer',
                boxShadow: isActive || isPending ? theme.lighting.shadow400 : 'none',
                ':hover': { color: theme.colors.primary, }
            })}
            onPointerDown={e => {
                startTransition(() => {
                    onPointerDown(e);
                });
            }}
        >
            {children}
        </button>
    );
};

const TabBg = function () {
    const [css, theme] = useStyletron();
    return (
        <div className={css({
            backgroundColor: 'rgb(71,71,71)', borderRadius: theme.borders.radius300, position: 'absolute',
            transformOrigin: '0 0', height: 'calc(100% - 8px)',
            transition: 'width cubic-bezier(0.4, 0, 0.1, 1) 0.4s, transform cubic-bezier(0.4, 0, 0.2, 1) 0.5s', zIndex: 1,
        })} />
    );
};

export default function RoundTab({ activeKey, names, onChange }) {
    const [css, theme] = useStyletron();
    const ref = React.useRef(null);

    const moveBg = async (index) => {
        if (ref.current) {
            const tab = ref.current.children[index];
            const bg = ref.current.lastElementChild;
            if (tab && bg) {
                bg.style.width = `${tab.offsetWidth}px`;
                bg.style.transform = `translateX(${tab.offsetLeft - 4}px)`;
            }
        }
    };

    React.useEffect(() => {
        moveBg(activeKey);
        // eslint-disable-next-line
    }, []);

    return (
        <div ref={ref} className={css({
            display: 'flex', alignItems: 'center', width: '100%',
            borderRadius: theme.borders.radius300, padding: theme.sizing.scale100,
            overflow: 'auto', backgroundColor: 'rgb(41,41,41)',
            whiteSpace: 'nowrap', position: 'relative',
        })}>
            {names.map((name, index) => (
                <TabButton key={index} isActive={activeKey === index} onPointerDown={(e) => {
                    moveBg(index);
                    e.activeKey = index;
                    if (onChange) onChange(e);
                }}>
                    {name}
                </TabButton>
            ))}
            <TabBg />
        </div>
    );
}
