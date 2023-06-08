import React from 'react';
import { Navigation } from 'baseui/side-navigation';
import { useNavigate } from 'react-router-dom';
import useWindowSize from '../../hooks/use-window-size';
import { MOBILE_BREAKPOINT_PX } from '../../constants';
import { Block } from 'baseui/block';
import RoundTab from '../../components/round-tab';

const sideMenus = [
    { title: '概览', itemId: '/admin-panel' },
    { title: '用户管理', itemId: '/admin-panel/users' },
    { title: '游戏管理', itemId: '/admin-panel/apps' },
    { title: '评测管理', itemId: '/admin-panel/reviews' },
    { title: '回复管理', itemId: '/admin-panel/comments' },
    { title: '新闻管理', itemId: '/admin-panel/news' },
    { title: '组织管理', itemId: '/admin-panel/organizations' },
    { title: '标签管理', itemId: '/admin-panel/tags' },
    { title: '礼物管理', itemId: '/admin-panel/gifts' },
    { title: '流行语管理', itemId: '/admin-panel/buzzwords' },
    { title: '探索页面管理', itemId: '/admin-panel/discover' },
];

function SideBar() {
    const pathname = new URL(window.location.href).pathname;
    const navigate = useNavigate();
    const windowSize = useWindowSize();
    return (
        <>
            {windowSize?.width > MOBILE_BREAKPOINT_PX ?
                <Navigation
                    items={sideMenus}
                    activeItemId={location.pathname}
                    onChange={({ event, item }) => {
                        event.preventDefault();
                        navigate(item.itemId);
                    }}
                /> :
                <Block>
                    <RoundTab activeKey={sideMenus.findIndex((item) => item.itemId.startsWith(pathname)) || 0} names={sideMenus.map(item => item.title)} onChange={({ activeKey }) => navigate(sideMenus[activeKey].itemId)} />
                </Block>
            }

        </>
    );
}

export default SideBar;