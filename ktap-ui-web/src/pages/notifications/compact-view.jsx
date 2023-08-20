import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Check } from 'baseui/icon';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { LabelSmall, LabelXSmall } from 'baseui/typography';

import { ListUnordered, TrashBin } from '@ktap/components/icons';
import RouterLink from '@ktap/components/router-link';

import { MENU_ITEMS } from './constants';
import NotificationList from './list';

function TitleBarAction({ color, ...rest }) {
    return (
        <Button $size='mini' $kind='tertiary' $shape='square' overrides={{
            BaseButton: {
                style: {
                    color
                }
            }
        }} {...rest} />
    );
}

function TabBar({ activeTab, onTabChange }) {
    const [css, theme] = useStyletron();

    const navigate = useNavigate();
    return (
        <Block display='flex' flexDirection='column' position='relative' overflow='auto'
            paddingLeft='scale600' paddingRight='scale600' paddingTop='scale300' paddingBottom='scale100'>
            <Block position='absolute' bottom={0} left={0} width='100%' height='scale0' backgroundColor='rgb(61, 61, 61)' />
            <Block display='flex' alignItems='center' justifyContent='space-between'>
                <Block display='flex' alignItems='center' gridGap='scale600'>
                    {MENU_ITEMS.map((item, index) => {
                        const isActive = activeTab === index;
                        return (<div key={index} className={css({
                            zIndex: 1,
                            display: 'flex', alignItems: 'center', color: isActive ? theme.colors.primary : theme.colors.primary300,
                            fontSize: theme.typography.LabelSmall.fontSize, fontFamily: theme.typography.LabelSmall.fontFamily,
                            fontWeight: theme.typography.LabelSmall.fontWeight, lineHeight: theme.typography.LabelSmall.lineHeight,
                            paddingTop: theme.sizing.scale300, paddingBottom: theme.sizing.scale300,
                            cursor: 'pointer', textUnderlineOffset: theme.sizing.scale500,
                            textDecoration: isActive ? 'underline solid 2px ' + theme.colors.primary : 'none',
                        })} onMouseDown={() => onTabChange(index)}>
                            {item.title}
                        </div>);
                    })}
                </Block>
                <Block display='flex' alignItems='center' color='primary300'>
                    <TitleBarAction color='inherit' title='全部清空'><TrashBin width='15px' height='15px' /></TitleBarAction>
                    <TitleBarAction color='inherit'><Check title='全部标记为已读' $size='scale800' /></TitleBarAction>
                    <TitleBarAction color='inherit' title='查看全部' onClick={() => navigate('/notifications')}><ListUnordered width='16px' height='16px' /></TitleBarAction>
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

    const dataList = [
        { type: 'system', content: { text: '你的昵称通过了审核' }, read: false, },
        { type: 'system', content: { text: '恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格' }, read: true, },
    ];

    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
        (async function fetchData() {
            try {
                setIsLoading(true);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    return (
        <Block display='flex' flexDirection='column'>
            <TitleBar />
            <TabBar activeTab={activeTab} onTabChange={to => setActiveTab(to)} />
            <NotificationList dataList={dataList} isLoading={isLoading} />
        </Block >
    );
}