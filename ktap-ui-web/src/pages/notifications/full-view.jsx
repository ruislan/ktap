import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Block } from 'baseui/block';
import { Navigation } from 'baseui/side-navigation';

import { LAYOUT_DEFAULT_CONTENT, LAYOUT_DEFAULT_SIDE, LAYOUT_SETTINGS_CONTENT, LAYOUT_SETTINGS_SIDE, MOBILE_BREAKPOINT } from '@ktap/libs/utils';
import Tabs from '@ktap/components/tabs';

import NotificationList from './list';
import { MENU_ITEMS } from './constants';

export default function FullView() {
    const navigate = useNavigate();
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
        <Block marginTop='scale900' display='flex' justifyContent='center' gridGap='scale900' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    [MOBILE_BREAKPOINT]: {
                        flexDirection: 'column', width: '100%',
                        marginTop: $theme.sizing.scale600,
                    }
                })
            }
        }}>
            <Block width={LAYOUT_SETTINGS_SIDE} margin={'0 8px 0 0'} overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            margin: '0', width: '100%', padding: $theme.sizing.scale300,
                        }
                    })
                }
            }}>
                <Navigation items={MENU_ITEMS}
                    activePredicate={(item,) => location.pathname + location.search === item.path}
                    mapItem={item => {
                        item.itemId = item.path;
                        return item;
                    }} onChange={({ event, item }) => {
                        event.preventDefault();
                        navigate(item.path);
                    }} />
            </Block>
            <Block width={LAYOUT_SETTINGS_CONTENT} margin={'0 0 0 8px'}
                overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            [MOBILE_BREAKPOINT]: {
                                width: 'auto',
                                marginLeft: $theme.sizing.scale300,
                                marginRight: $theme.sizing.scale300,
                            },
                        })
                    }
                }}
            >
                <Tabs activeKey={MENU_ITEMS.findIndex((v,) => v.path == location.pathname + location.search)} names={MENU_ITEMS.map(m => m.title)} onChange={e => navigate(MENU_ITEMS[e.activeKey].path)} />
                <NotificationList dataList={dataList} isLoading={isLoading} />
            </Block>
        </Block>
    );
}