import React from 'react';
import { Navigation } from 'baseui/side-navigation';
import { useNavigate } from 'react-router-dom';

function SideBar() {
    const navigate = useNavigate();
    return (
        <>
            <Navigation
                items={[
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
                ]}
                activeItemId={location.pathname}
                onChange={({ event, item }) => {
                    event.preventDefault();
                    navigate(item.itemId);
                }}
            />
        </>
    );
}

export default SideBar;