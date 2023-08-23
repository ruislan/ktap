import { useNavigate } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Check } from 'baseui/icon';

import { TrashBin, ListUnordered } from '@ktap/components/icons';

import { MENU_ITEMS } from './constants';
import { LabelMedium } from 'baseui/typography';

function ActionButton({ color, ...rest }) {
    const [css, theme] = useStyletron();
    return (
        <div className={css({
            color, background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: theme.sizing.scale800, width: theme.sizing.scale800,
        })} {...rest} />
    );
}

function TabBar({ activeIndex, onTabChange }) {
    const [css, theme] = useStyletron();

    const navigate = useNavigate();
    return (
        <Block display='flex' flexDirection='column' position='relative' overflow='auto'
            paddingLeft='scale600' paddingRight='scale600'>
            <Block position='absolute' bottom={0} left={0} width='100%' height='scale0' backgroundColor='rgb(61, 61, 61)' />
            <Block display='flex' alignItems='center' justifyContent='space-between'>
                <Block display='flex' alignItems='center' gridGap='scale600'>
                    {MENU_ITEMS.map((item, index) => {
                        const isActive = activeIndex === index;
                        return (<div key={index} className={css({
                            zIndex: 1, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', color: isActive ? theme.colors.primary : theme.colors.primary300,
                            fontSize: theme.typography.LabelSmall.fontSize, fontFamily: theme.typography.LabelSmall.fontFamily,
                            fontWeight: theme.typography.LabelSmall.fontWeight, lineHeight: theme.typography.LabelSmall.lineHeight,
                            paddingTop: theme.sizing.scale500, paddingBottom: isActive ? theme.sizing.scale400 : theme.sizing.scale500,
                            borderBottom: isActive ? '2px solid ' + theme.colors.primary : null,
                        })} onMouseDown={() => onTabChange(index)}>
                            {item.title}
                        </div>);
                    })}
                </Block>
                <Block display='flex' alignItems='center' color='primary300'>
                    <ActionButton color='inherit' title='全部清空'><TrashBin width='15px' height='15px' /></ActionButton>
                    <ActionButton color='inherit'><Check title='全部标记为已读' $size='scale800' /></ActionButton>
                    <ActionButton color='inherit' title='查看全部' onClick={() => navigate(activeIndex === 0 ? '/notifications' : `/notifications?type=${MENU_ITEMS[activeIndex].type}`)}><ListUnordered width='16px' height='16px' /></ActionButton>
                </Block>
            </Block>
        </Block>
    );
}

function TitleBar({ activeIndex }) {
    return (
        <Block display='flex' alignItems='center' color='primary300' marginTop='scale300' marginBottom='scale300'
            paddingLeft='scale300' paddingRight='scale300' paddingBottom='scale300' justifyContent='space-between'
            overrides={{
                Block: {
                    style: {
                        borderBottom: '2px solid rgb(61,61,61)',
                    }
                }
            }}>
            <LabelMedium>{MENU_ITEMS[activeIndex].title + '通知'}</LabelMedium>
            <Block display='flex' alignItems='center' gridGap='scale300'>
                <ActionButton color='inherit' title='全部清空'><TrashBin width='15px' height='15px' /></ActionButton>
                <ActionButton color='inherit' ><Check title='全部标记为已读' $size='scale800' /></ActionButton>
            </Block>
        </Block>
    );
}

export { TitleBar, TabBar };