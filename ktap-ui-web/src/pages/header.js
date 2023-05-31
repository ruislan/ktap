import React from 'react';
import { AppNavBar } from 'baseui/app-nav-bar';
import { useAuth } from '../hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import RouterLink from '../components/router-link';

// 这个AppNav，目前BaseWeb写得不太好。
// 例如：
//  1. 在Mobile的情况下，不能直接刷新已经登录的User，需要点击头像按钮，然后返回才可以刷新。
//  2. 如果在外层不使用样式：contain: 'paint'，会导致边缘留白等情况
//  3. 在Mobile的情况下，菜单太难看等等
function Header() {
    const pathname = new URL(window.location.href).pathname;
    const navigate = useNavigate();
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const [mainItems, setMainItems] = React.useState([]);
    const [userItems, setUserItems] = React.useState([]);

    React.useEffect(() => {
        if (isAuthenticated()) {
            const items = [
                { label: '个人中心', href: `/users/${user?.id}` },
                { label: '消费历史', href: `/tradings/history` },
                { label: '设置', href: '/settings' },
            ];
            if (isAdmin()) items.push({ label: '管理', href: '/admin-panel' });
            items.push({ label: '退出', href: '/logout' });
            setUserItems(items);
        } else {
            setUserItems([
                { label: '登录', href: '/login' },
                { label: '注册', href: '/register' },
            ]);
        }
    }, [isAdmin, isAuthenticated, user]);

    React.useEffect(() => {
        setMainItems([
            { label: '首页', href: '/', active: pathname === '/' },
            { label: '探索', href: '/discover', active: pathname.startsWith('/discover') },
            { label: '榜单', href: '/ranks', active: pathname.startsWith('/ranks') },
            { label: '新闻', href: '/news', active: pathname.startsWith('/news') },
        ]);
    }, [pathname]);

    const userItemSelectHandler = item => {
        if (item.href === '/logout') {
            logout().then(() => navigate('/', { replace: true }));
        } else {
            navigate(item.href);
        }
    };

    return (
        <header>
            <AppNavBar
                title={<span>KTap</span>}
                mainItems={mainItems}
                mapItemToNode={item => (<RouterLink href={item.href} role='NavLink'>{item.label}</RouterLink>)}
                userItems={userItems}
                onUserItemSelect={userItemSelectHandler}
                username={user?.name}
                usernameSubtitle={user && `余额: ${user?.balance}`}
                userImgUrl={user?.avatar}
            />
        </header>
    );
}

export default Header;