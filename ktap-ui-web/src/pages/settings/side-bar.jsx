import { useNavigate } from 'react-router-dom';

import { Navigation } from 'baseui/side-navigation';
import { Block } from 'baseui/block';

import useWindowSize from '@ktap/hooks/use-window-size';
import { MOBILE_BREAKPOINT_PX } from '@ktap/libs/utils';
import RoundTab from '@ktap/components/round-tab';

const sideMenus = [
    { title: '基本信息', itemId: '/settings' },
    { title: '个性化', itemId: '/settings/profile' },
    { title: '密码', itemId: '/settings/password' },
];

function SideBar() {
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
                <Block display='flex' alignItems='center' marginBottom='scale600'>
                    <RoundTab activeKey={sideMenus.findIndex((item) => item.itemId.startsWith(location.pathname)) || 0} names={sideMenus.map(item => item.title)} onChange={({ activeKey }) => navigate(sideMenus[activeKey].itemId)} />
                </Block>
            }
        </>
    );
}

export default SideBar;