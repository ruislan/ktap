import React from 'react';
import { Navigation } from 'baseui/side-navigation';
import { useNavigate } from 'react-router-dom';

function SideBar() {
    const navigate = useNavigate();
    return (
        <>
            <Navigation
                items={[
                    { title: '基本信息', itemId: '/settings' },
                    { title: '个性化', itemId: '/settings/profile' },
                    { title: '密码', itemId: '/settings/password' },
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