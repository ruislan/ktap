import React from 'react';
import { useAuth } from '../hooks/use-auth';
import { Link, useNavigate } from 'react-router-dom';
import { MOBILE_BREAKPOINT, MOBILE_BREAKPOINT_PX } from '../constants';
import { useStyletron } from 'baseui';
import { User, Coins } from '../components/icons';
import { Delete, Menu } from 'baseui/icon';

// 这个AppNav，目前BaseWeb写得不太好。
// 例如：
//  1. 在Mobile的情况下，不能直接刷新已经登录的User，需要点击头像按钮，然后返回才可以刷新。
//  2. 如果在外层不使用样式：contain: 'paint'，会导致边缘留白等情况
//  3. 在Mobile的情况下，菜单太难看等等
function Header() {
    const [css, theme] = useStyletron();
    const pathname = new URL(window.location.href).pathname;
    const navigate = useNavigate();
    const { user, logout, isAuthenticated, isAdmin } = useAuth();

    const [mainItems, setMainItems] = React.useState([]);
    const [showMainItems, setShowMainItems] = React.useState(false);

    const [userItems, setUserItems] = React.useState([]);
    const [showUserItems, setShowUserItems] = React.useState(false);
    const userItemsRef = React.useRef(null);
    const userItemStyle = css({
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: theme.borders.radius200,
        paddingLeft: theme.sizing.scale600, paddingRight: theme.sizing.scale600,
        paddingTop: theme.sizing.scale300, paddingBottom: theme.sizing.scale300,
        fontWeight: 500, fontSize: theme.sizing.scale600, lineHeight: theme.sizing.scale800,
        clear: 'both', width: '100%', whiteSpace: 'nowrap', border: 0,
        textDecoration: 'none',
        color: theme.colors.primary,
        cursor: 'pointer',
        ':hover': {
            backgroundColor: 'rgb(31, 31, 31)',
        },
    });

    React.useEffect(() => {
        if (isAuthenticated()) {
            const items = [
                { label: '个人中心', href: `/users/${user?.id}`, },
                { label: '交易历史', href: `/tradings/history` },
                { label: '设置', href: '/settings' },
            ];
            if (isAdmin()) {
                items.push({ role: 'divider' });
                items.push({ label: '管理', href: '/admin-panel' });
            }
            items.push({ role: 'divider' });
            items.push({ label: '退出', href: '/logout', role: 'button' });
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
            { label: '讨论', href: '/discussions', active: pathname.startsWith('/discussions') },
        ]);
    }, [pathname]);

    React.useEffect(() => {
        function handleClickOutside(e) {
            if (userItemsRef.current && !userItemsRef.current.contains(e.target)) {
                setShowUserItems(false);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <header>
            <nav className={css({
                width: '100%', backgroundColor: 'transparent', top: '0',
                minHeight: '68px', display: 'flex', alignItems: 'stretch', justifyContent: 'center',
                boxShadow: 'none', borderBottom: '1px solid rgb(51,51,51)',
                [MOBILE_BREAKPOINT]: {
                    flexDirection: 'column',
                    minHeight: '58px',
                }
            })}>
                <div className={css({
                    display: 'flex', alignItems: 'center', width: '100%', paddingLeft: theme.sizing.scale600, paddingRight: theme.sizing.scale600,
                    maxWidth: MOBILE_BREAKPOINT_PX + 32 + 'px', flexWrap: 'nowrap',
                    [MOBILE_BREAKPOINT]: {
                        paddingLeft: theme.sizing.scale500, paddingRight: theme.sizing.scale500,
                        paddingTop: theme.sizing.scale0, paddingBottom: theme.sizing.scale0,
                    }
                })}>
                    <div className={css({
                        display: 'none',
                        [MOBILE_BREAKPOINT]: {
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                            marginRight: theme.sizing.scale500,
                        }
                    })}>
                        <div className={css({
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                        })} onClick={e => {
                            e.stopPropagation();
                            setShowMainItems(!showMainItems);
                            userItems && setShowUserItems(false);
                        }}>{showMainItems ? <Delete size='scale900' /> : <Menu size='scale900' />}</div>
                    </div>

                    <div className={css({
                        fontFamily: 'system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 700,
                        lineHeight: theme.sizing.scale900, fontSize: theme.sizing.scale700,
                        marginRight: theme.sizing.scale600, display: 'flex', alignItems: 'center', gap: theme.sizing.scale100,
                        [MOBILE_BREAKPOINT]: {
                            flex: 1, marginRight: 0,
                        }
                    })}>
                        <div className={css({
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: theme.colors.primary, borderRadius: theme.borders.radius300,
                            color: theme.colors.contentInversePrimary, width: theme.sizing.scale950, height: theme.sizing.scale950,
                        })}>K</div>
                        <span>Tap</span>
                    </div>

                    <div className={css({
                        display: 'flex', flex: '1', alignItems: 'center', height: '100%',
                        [MOBILE_BREAKPOINT]: {
                            visibility: showMainItems ? 'visible' : 'hidden',
                            opacity: showMainItems ? 1 : 0,
                            position: 'absolute', width: '100%',
                            backgroundColor: 'rgb(41,41,41)',
                            top: '58px', left: 0, right: 0,
                            padding: theme.sizing.scale600, zIndex: 9996,
                            transition: 'all 0.3s ease-in-out',
                            transform: showMainItems ? 'translateX(0)' : 'translateX(-100%)',
                        },
                    })}>
                        <ul className={css({
                            display: 'flex', flexDirection: 'row', listStyle: 'none', margin: '0', padding: '0', height: '100%',
                            fontFamily: 'system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
                            [MOBILE_BREAKPOINT]: {
                                flexDirection: 'column',
                            },
                        })}>
                            {mainItems.map((item, index) => (
                                <li key={index} className={css({
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    paddingLeft: theme.sizing.scale300, paddingRight: theme.sizing.scale300,
                                    boxShadow: item.active ? 'inset 0 -4px ' + theme.colors.primary : 'unset',
                                    [MOBILE_BREAKPOINT]: {
                                        padding: theme.sizing.scale600,
                                    }
                                })}>
                                    <Link to={item.href} className={css({
                                        textDecoration: 'none', fontSize: theme.sizing.scale600,
                                        paddingLeft: theme.sizing.scale300, paddingRight: theme.sizing.scale300,
                                        fontWeight: item.active ? 700 : 500, whiteSpace: 'nowrap',
                                        color: item.active ? theme.colors.primary : theme.colors.contentTertiary,
                                        ':hover': {
                                            color: theme.colors.primary,
                                        }
                                    })} onClick={() => showMainItems && setShowMainItems(false)}>{item.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className={css({
                        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                        gap: theme.sizing.scale600,
                    })}>
                        {user && <div className={css({
                            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                            color: theme.colors.primary100, gap: theme.sizing.scale100, fontWeight: 700,
                        })}>
                            <Coins width='24px' height='24px' /> <span>{user?.balance || 0}</span>
                        </div>}
                        <div className={css({ position: 'relative', })}>
                            <div className={css({
                                width: theme.sizing.scale950, height: theme.sizing.scale950,
                                backgroundColor: theme.colors.backgroundInversePrimary,
                                borderRadius: theme.borders.radius300,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            })} onClick={e => {
                                e.stopPropagation();
                                setShowUserItems(!showUserItems);
                                showMainItems && setShowMainItems(false);
                            }
                            }>
                                {user?.avatar ?
                                    <img src={user?.avatar} width='100%' height='100%' className={css({
                                        objectFit: 'cover',
                                        borderRadius: theme.borders.radius300,
                                    })} /> :
                                    <User color={theme.colors.backgroundPrimary} width='24px' height='24px' />
                                }
                            </div>
                            {/* user items menu */}
                            {showUserItems && (
                                <ul ref={userItemsRef} className={css({
                                    zIndex: 9999,
                                    position: 'absolute', top: '100%', left: 'auto', right: '0', marginBottom: '0',
                                    marginTop: theme.sizing.scale300,
                                    backgroundColor: 'rgb(41,41,41)', padding: theme.sizing.scale100,
                                    listStyle: 'none', borderRadius: theme.borders.radius300,
                                    boxShadow: theme.lighting.shadow600,
                                    minWidth: '10rem',
                                })}>
                                    {userItems.map((item, index) => (
                                        <li key={index}>
                                            {item.role === 'button' ?
                                                <div className={userItemStyle} onClick={() => {
                                                    if (item.href === '/logout') {
                                                        logout().then(() => navigate('/', { replace: true }));
                                                    } else {
                                                        navigate(item.href);
                                                    }
                                                    setShowUserItems(false);
                                                }}>{item.label}</div> :
                                                item.role === 'divider' ?
                                                    <hr className={css({
                                                        width: '100%', height: '0', marginTop: theme.sizing.scale100, marginBottom: theme.sizing.scale100,
                                                        border: 0,
                                                        borderTop: '1px solid rgba(255, 255, 255, 0.15)', overflow: 'hidden', opacity: 1, color: 'inherit',
                                                    })} /> :
                                                    <Link className={userItemStyle} to={item.href} onClick={() => setShowUserItems(false)}>{item.label}</Link>
                                            }
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;