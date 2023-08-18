import React from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Delete, Menu } from 'baseui/icon';

import { useAuth } from '@ktap/hooks/use-auth';
import { useOutsideClick } from '@ktap/hooks/use-outside-click';
import { LAYOUT_DEFAULT_SIDE, MOBILE_BREAKPOINT, MOBILE_BREAKPOINT_PX } from '@ktap/libs/utils';
import { User as UserIcon, Coins, Bell, FatSearch } from '@ktap/components/icons';
import { CompactView as Notifications } from '@ktap/pages/notifications';

const Brand = function () {
    const [css, theme] = useStyletron();
    return (
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
    );
};

const MainMenu = function () {
    const [css, theme] = useStyletron();
    const location = useLocation();
    const mainItemsRef = React.useRef(null);
    const [mainItems, setMainItems] = React.useState([]);
    const [showMainItems, setShowMainItems] = React.useState(false);

    React.useEffect(() => {
        const pathname = location.pathname;
        setMainItems([
            { label: '首页', href: '/', active: pathname === '/' },
            { label: '探索', href: '/discover', active: pathname.startsWith('/discover') },
            { label: '榜单', href: '/ranks', active: pathname.startsWith('/ranks') },
            { label: '新闻', href: '/news', active: pathname.startsWith('/news') },
            { label: '讨论', href: '/discussions', active: pathname.startsWith('/discussions') },
        ]);
    }, [location]);

    useOutsideClick({ ref: mainItemsRef, handler: () => setShowMainItems(false) });

    return (
        <>
            <div className={css({
                display: 'none',
                [MOBILE_BREAKPOINT]: {
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                    marginRight: theme.sizing.scale500,
                }
            })}>
                <div
                    className={css({
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                    })}
                    onClick={() => setShowMainItems(!showMainItems)}
                >{showMainItems ? <Delete size='scale900' /> : <Menu size='scale900' />}</div>
            </div>
            {/* Brand */} <Brand />
            <div ref={mainItemsRef} className={css({
                display: 'flex', flex: '1', alignItems: 'center', height: '100%',
                [MOBILE_BREAKPOINT]: {
                    visibility: showMainItems ? 'visible' : 'hidden',
                    opacity: showMainItems ? 1 : 0,
                    position: 'absolute', width: '100%',
                    backgroundColor: 'rgb(41,41,41)',
                    top: '58px', left: 0, right: 0,
                    padding: theme.sizing.scale600, zIndex: 9996,
                    transform: showMainItems ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.2s ease',
                },
            })}>
                <ul className={css({
                    display: 'flex', listStyle: 'none', margin: '0', padding: '0', height: '100%',
                    fontFamily: 'system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    [MOBILE_BREAKPOINT]: {
                        flexDirection: 'column',
                    },
                })}>
                    {mainItems.map((item, index) => {
                        const active = item.active;
                        return (<li key={index} className={css({
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            paddingLeft: theme.sizing.scale300, paddingRight: theme.sizing.scale300,
                            boxShadow: active ? 'inset 0 -4px ' + theme.colors.primary : 'unset',
                            [MOBILE_BREAKPOINT]: {
                                padding: theme.sizing.scale600,
                            }
                        })}>
                            <Link to={item.href}
                                className={css({
                                    textDecoration: 'none', fontSize: theme.sizing.scale600,
                                    paddingLeft: theme.sizing.scale300, paddingRight: theme.sizing.scale300,
                                    fontWeight: active ? 700 : 500, whiteSpace: 'nowrap',
                                    color: active ? theme.colors.primary : theme.colors.contentTertiary,
                                    ':hover': {
                                        color: theme.colors.primary,
                                    }
                                })}
                                onClick={() => showMainItems && setShowMainItems(false)}
                            >{item.label}</Link>
                        </li>);
                    })}
                </ul>
            </div>
        </>
    );
};

const ActionMenu = function () {
    const [css, theme] = useStyletron();
    const { user } = useAuth();

    return (
        <div className={css({
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: theme.sizing.scale200, [MOBILE_BREAKPOINT]: { gap: theme.sizing.scale0 }
        })}>
            {!location.pathname.startsWith('/search') && <SearchInput />}
            {user && !location.pathname.startsWith('/notifications') && <UserNotification />}
            {user && <div className={css({
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: theme.colors.primary100, gap: theme.sizing.scale100, fontWeight: 700,
                marginRight: theme.sizing.scale200,
            })}>
                <Coins width='24px' height='24px' />
                <span>{user?.balance || 0}</span>
            </div>}
            <UserMenu />
        </div>
    );
};

const SearchInput = function () {
    const [css, theme] = useStyletron();
    const navigate = useNavigate();
    const keywordRef = React.useRef(null);

    const doSearch = () => {
        const keyword = keywordRef.current?.value;
        if (keyword && keyword.length > 0) {
            navigate(`/search?q=${keyword}`);
        }
    };

    return (
        <div className={css({
            display: 'flex', alignItems: 'center', color: theme.colors.primary100,
            height: theme.sizing.scale950, backgroundColor: 'rgb(41, 41, 41)',
            userSelect: 'none', borderRadius: theme.borders.radius300,
            marginRight: theme.sizing.scale200,
            [MOBILE_BREAKPOINT]: { backgroundColor: 'unset' },
        })}>
            <div
                className={css({
                    pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    userSelect: 'none',
                    minWidth: theme.sizing.scale950, padding: theme.sizing.scale200,
                    [MOBILE_BREAKPOINT]: {
                        pointerEvents: 'unset', padding: 0, margin: 0,
                        minWidth: 'auto', width: 'auto',
                    }
                })}
                onClick={e => {
                    e.preventDefault();
                    navigate('/search');
                }}>
                <FatSearch className={css({ [MOBILE_BREAKPOINT]: { width: '23px', height: '23px' } })} width='16px' height='16px' />
            </div>
            <input ref={keywordRef}
                className={css({
                    outline: 'none', border: 0, background: 'none', margin: 0,
                    paddingLeft: 0, paddingRight: theme.sizing.scale550,
                    paddingTop: theme.sizing.scale200, paddingBottom: theme.sizing.scale200,
                    color: 'inherit', fontSize: theme.typography.LabelSmall.fontSize,
                    fontFamily: theme.typography.LabelSmall.fontFamily,
                    lineHeight: theme.typography.LabelSmall.lineHeight,
                    caretColor: 'inherit', cursor: 'text', appearance: 'none',
                    height: '100%', width: '100%', minWidth: '0px', maxWidth: '100%',
                    [MOBILE_BREAKPOINT]: { display: 'none', },
                })}
                placeholder='搜索...'
                onKeyUp={e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        doSearch();
                    }
                }} />
        </div>
    );
};

const UserNotification = function () {
    const [css, theme] = useStyletron();
    const navigate = useNavigate();
    const [isOpenContent, setIsOpenContent] = React.useState(false);
    const ref = React.useRef(null);
    useOutsideClick({ ref, handler: () => setIsOpenContent(false) });
    return (
        <div ref={ref} className={css({ position: 'relative' })}>
            <div
                className={css({
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: theme.colors.primary100, marginRight: theme.sizing.scale200,
                })}
                onClick={e => {
                    e.stopPropagation();
                    window.screen.width > MOBILE_BREAKPOINT_PX ? setIsOpenContent(!isOpenContent) : navigate('/notifications');
                }}>
                <Bell width='24px' height='24px' />
            </div>
            {isOpenContent && <div className={css({
                zIndex: 666, minWidth: '10rem', outline: 'none',
                position: 'absolute', top: '100%', left: 'auto', right: '0',
                marginBottom: '0', marginTop: theme.sizing.scale300,
                backgroundColor: 'rgb(41,41,41)', borderRadius: theme.borders.radius300,
                boxShadow: theme.lighting.shadow600,
                [MOBILE_BREAKPOINT]: {
                    right: '-120px',
                }
            })}>
                <div className={css({ width: LAYOUT_DEFAULT_SIDE, maxHeight: '400px', overflow: 'auto', })}>
                    <Notifications />
                </div>
            </div>}
        </div>
    );
};

const UserMenu = function () {
    const [css, theme] = useStyletron();
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [userItems, setUserItems] = React.useState([]);
    const [isOpenContent, setIsOpenContent] = React.useState(false);
    const ref = React.useRef(null);
    const menuItemStyle = css({
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: theme.borders.radius300, outline: 'none',
        paddingLeft: theme.sizing.scale600, paddingRight: theme.sizing.scale600,
        paddingTop: theme.sizing.scale300, paddingBottom: theme.sizing.scale300,
        fontWeight: 500, fontSize: theme.sizing.scale600, lineHeight: theme.sizing.scale800,
        clear: 'both', width: '100%', whiteSpace: 'nowrap', border: 0,
        textDecoration: 'none', color: theme.colors.primary, cursor: 'pointer',
        ':hover': {
            backgroundColor: 'rgb(71, 71, 71)',
            boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
        },
    });

    React.useEffect(() => {
        if (isAuthenticated()) {
            const items = [
                { label: '个人中心', href: `/users/${user.id}`, },
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
                { label: '登录', href: location.pathname.startsWith('/login') ? location.pathname + location.search : `/login?from=${location.pathname}${location.search}` },
                { label: '注册', href: '/register' },
            ]);
        }
    }, [isAdmin, isAuthenticated, user]);

    useOutsideClick({ ref, handler: () => setIsOpenContent(false) });

    return (
        <div ref={ref} className={css({ position: 'relative', })}>
            <div
                className={css({
                    backgroundColor: 'transparent',
                    borderRadius: theme.borders.radius300,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                })}
                onClick={e => {
                    e.stopPropagation();
                    setIsOpenContent(!isOpenContent);
                }}>
                {user?.avatar ?
                    <img src={user?.avatar} className={css({
                        width: theme.sizing.scale950, height: theme.sizing.scale950,
                        objectFit: 'cover',
                        borderRadius: theme.borders.radius300,
                    })} /> :
                    <UserIcon color={theme.colors.primary} width='24px' height='24px' />
                }
            </div>
            {/* user items menu */}
            {isOpenContent && (
                <ul className={css({
                    zIndex: 666, minWidth: '10rem', outline: 'none',
                    position: 'absolute', top: '100%', left: 'auto', right: '0',
                    marginBottom: '0', marginTop: theme.sizing.scale300,
                    backgroundColor: 'rgb(41,41,41)', padding: theme.sizing.scale100,
                    listStyle: 'none', borderRadius: theme.borders.radius300,
                    boxShadow: theme.lighting.shadow600,
                })}>
                    {userItems.map((item, index) => (
                        <li key={index}>
                            {item.role === 'button' ?
                                <div className={menuItemStyle} onClick={() => {
                                    item.href === '/logout' ? logout(location.pathname) : navigate(item.href);
                                    isOpenContent && setIsOpenContent(false);
                                }}>{item.label}</div> :
                                item.role === 'divider' ?
                                    <hr className={css({
                                        width: '100%', height: '0', marginTop: theme.sizing.scale100, marginBottom: theme.sizing.scale100,
                                        border: 0,
                                        borderTop: '1px solid rgba(255, 255, 255, 0.15)', overflow: 'hidden', opacity: 1, color: 'inherit',
                                    })} /> :
                                    <Link className={menuItemStyle} to={item.href} onClick={() => isOpenContent && setIsOpenContent(false)}>{item.label}</Link>
                            }
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default function Header() {
    const [css, theme] = useStyletron();
    return (
        <header>
            <nav className={css({
                width: '100%', backgroundColor: 'transparent', top: '0',
                minHeight: '64px', display: 'flex', alignItems: 'stretch', justifyContent: 'center',
                boxShadow: 'none',
                borderBottom: '1px solid rgb(51,51,51)',
                [MOBILE_BREAKPOINT]: {
                    flexDirection: 'column',
                    minHeight: '58px',
                }
            })}>
                <div className={css({
                    display: 'flex', alignItems: 'center', width: '100%', paddingLeft: theme.sizing.scale600, paddingRight: theme.sizing.scale600,
                    maxWidth: MOBILE_BREAKPOINT_PX + 32 + 132 + 'px', flexWrap: 'nowrap',
                    [MOBILE_BREAKPOINT]: {
                        paddingLeft: theme.sizing.scale500, paddingRight: theme.sizing.scale500,
                        paddingTop: theme.sizing.scale0, paddingBottom: theme.sizing.scale0,
                    }
                })}>

                    {/* Menu  */} <MainMenu />
                    {/* Action */} <ActionMenu />
                </div>
            </nav>
        </header>
    );
}