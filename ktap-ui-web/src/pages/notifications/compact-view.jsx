import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Check } from 'baseui/icon';
import { Block } from 'baseui/block';
import { LabelSmall, LabelXSmall } from 'baseui/typography';

import { ListUnordered, TrashBin } from '@ktap/components/icons';
import RouterLink from '@ktap/components/router-link';

import { MENU_ITEMS } from './constants';
import NotificationList from './list';
import ActionButton from './action-button';


function TabBar({ activeTab, onTabChange }) {
    const [css, theme] = useStyletron();

    const navigate = useNavigate();
    return (
        <Block display='flex' flexDirection='column' position='relative' overflow='auto'
            paddingLeft='scale600' paddingRight='scale600'>
            <Block position='absolute' bottom={0} left={0} width='100%' height='scale0' backgroundColor='rgb(61, 61, 61)' />
            <Block display='flex' alignItems='center' justifyContent='space-between'>
                <Block display='flex' alignItems='center' gridGap='scale600'>
                    {MENU_ITEMS.map((item, index) => {
                        const isActive = activeTab === index;
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
                    <ActionButton color='inherit' title='查看全部' onClick={() => navigate('/notifications')}><ListUnordered width='16px' height='16px' /></ActionButton>
                </Block>
            </Block>
        </Block>
    );
}

const TitleBar = React.memo(function TitleBar() {
    return (
        <Block display='flex' alignItems='center' justifyContent='space-between'
            paddingLeft='scale600' paddingRight='scale600' paddingTop='scale600' paddingBottom='scale300'>
            <LabelSmall>通知中心</LabelSmall>
            <RouterLink href='/notifications'><LabelXSmall color='primary300'>设置</LabelXSmall></RouterLink>
        </Block>
    );
});

export default function CompactView() {
    const [activeTab, setActiveTab] = React.useState(0);

    return (
        <Block display='flex' flexDirection='column'>
            <TitleBar />
            <TabBar activeTab={activeTab} onTabChange={to => setActiveTab(to)} unread={4} />
            <NotificationList activeIndex={activeTab} />
        </Block >
    );
}