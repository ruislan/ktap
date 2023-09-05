import { useNavigate } from 'react-router-dom';

import { Navigation } from 'baseui/side-navigation';
import { Block } from 'baseui/block';

import useWindowSize from '@ktap/hooks/use-window-size';
import { MOBILE_BREAKPOINT_PX } from '@ktap/libs/utils';
import Tabs from '@ktap/components/tabs';

const sideMenus = [
    { title: '基本信息', itemId: '/settings' },
    { title: '个性化', itemId: '/settings/profile' },
    { title: '密码', itemId: '/settings/password' },
    { title: '消息通知', itemId: '/settings/notification' },
];

function SideBar() {
    const navigate = useNavigate();
    const windowSize = useWindowSize();

    if (!windowSize || !windowSize.width) return null;

    if (windowSize?.width > MOBILE_BREAKPOINT_PX) return (
        <Navigation
            items={sideMenus}
            activeItemId={location.pathname}
            onChange={({ event, item }) => {
                event.preventDefault();
                navigate(item.itemId);
            }}
        />
    );

    return (
        <Block display='flex' alignItems='center' marginBottom='scale600'>
            <Tabs activeKey={sideMenus.findIndex((item) => item.itemId.startsWith(location.pathname)) || 0} names={sideMenus.map(item => item.title)} onChange={({ activeKey }) => navigate(sideMenus[activeKey].itemId)} />
        </Block>
    );
}

export default SideBar;