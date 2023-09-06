import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Block } from 'baseui/block';
import { Navigation } from 'baseui/side-navigation';

import useWindowSize from '@ktap/hooks/use-window-size';
import { MOBILE_BREAKPOINT_PX } from '@ktap/libs/utils';
import Tabs from '@ktap/components/tabs';

const sideMenus = [
    { title: '概览', itemId: '/admin-panel' },
    { title: '用户管理', itemId: '/admin-panel/users' },
    { title: '游戏管理', itemId: '/admin-panel/apps' },
    { title: '评测管理', itemId: '/admin-panel/reviews' },
    { title: '评论管理', itemId: '/admin-panel/discussions' },
    { title: '新闻管理', itemId: '/admin-panel/news' },
    { title: '组织管理', itemId: '/admin-panel/organizations' },
    { title: '标签管理', itemId: '/admin-panel/tags' },
    { title: '礼物管理', itemId: '/admin-panel/gifts' },
    { title: '流行语管理', itemId: '/admin-panel/buzzwords' },
    { title: '探索页面管理', itemId: '/admin-panel/discover' },
    { title: '搜索热词管理', itemId: '/admin-panel/hotsearch' },
];

function SideBar() {
    const navigate = useNavigate();
    const windowSize = useWindowSize();

    if (windowSize?.width <= MOBILE_BREAKPOINT_PX) {
        return (
            <Block display='flex' alignItems='center' marginBottom='scale600'>
                <Tabs activeKey={sideMenus.findIndex((item) => item.itemId.startsWith(location.pathname)) || 0} names={sideMenus.map(item => item.title)} onChange={({ activeKey }) => navigate(sideMenus[activeKey].itemId)} />
            </Block>
        );
    }
    return (
        <Navigation items={sideMenus} activeItemId={location.pathname}
            onChange={({ event, item }) => {
                event.preventDefault();
                navigate(item.itemId);
            }}
        />
    );
}

export default SideBar;