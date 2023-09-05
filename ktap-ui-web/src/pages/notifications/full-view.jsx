import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Navigation } from 'baseui/side-navigation';
import { HeadingSmall, LabelSmall } from 'baseui/typography';

import { LAYOUT_SETTINGS_CONTENT, LAYOUT_SETTINGS_SIDE, MOBILE_BREAKPOINT, MOBILE_BREAKPOINT_PX } from '@ktap/libs/utils';
import Tabs from '@ktap/components/tabs';
import RouterLink from '@ktap/components/router-link';
import useWindowSize from '@ktap/hooks/use-window-size';

import { MENU_ITEMS } from './constants';
import Notifications from './notifications';

const TopBar = React.memo(function TopBar() {
    return (
        <Block display='flex' alignItems='center' justifyContent='space-between' marginBottom='scale600'
            paddingLeft='scale600' paddingRight='scale600' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            marginBottom: $theme.sizing.scale300,
                        }
                    })
                }
            }}>
            <HeadingSmall margin='0'>通知中心</HeadingSmall>
            <RouterLink kind='underline' href='/settings/notification'><LabelSmall>设置</LabelSmall></RouterLink>
        </Block>
    );
});

function Menus({ activeIndex }) {
    const { width } = useWindowSize();
    const navigate = useNavigate();

    if (width > MOBILE_BREAKPOINT_PX) {
        return (
            <Navigation items={MENU_ITEMS}
                activePredicate={(item,) => item.path === MENU_ITEMS[activeIndex].path}
                mapItem={item => {
                    item.itemId = item.path;
                    return item;
                }} onChange={({ event, item }) => {
                    event.preventDefault();
                    navigate(item.path);
                }} />
        );
    }
    return (
        <Tabs activeKey={activeIndex} names={MENU_ITEMS.map(m => m.title)} onChange={e => navigate(MENU_ITEMS[e.activeKey].path)} />
    );
}

export default function FullView() {
    const [, theme] = useStyletron();
    const location = useLocation();
    const activeIndex = MENU_ITEMS.findIndex((v,) => v.path == location.pathname + location.search);

    return (
        <Block display='flex' flexDirection='column' marginTop='scale900' overrides={{
            Block: {
                style: {
                    [MOBILE_BREAKPOINT]: {
                        marginTop: theme.sizing.scale600,
                        width: '100%',
                    },
                }
            }
        }}>
            <TopBar />
            <Block display='flex' justifyContent='center' paddingLeft='scale600' paddingRight='scale600'
                gridGap='scale900' overrides={{
                    Block: {
                        style: {
                            [MOBILE_BREAKPOINT]: {
                                flexDirection: 'column', gap: theme.sizing.scale600,
                            },
                        }
                    }
                }}>
                <Block width={LAYOUT_SETTINGS_SIDE} overrides={{
                    Block: {
                        style: {
                            [MOBILE_BREAKPOINT]: { width: '100%', marginTop: theme.sizing.scale600, }
                        }
                    }
                }}>
                    <Menus activeIndex={activeIndex} />
                </Block>
                <Block display='flex' flexDirection='column' width={LAYOUT_SETTINGS_CONTENT}
                    overrides={{
                        Block: {
                            style: {
                                [MOBILE_BREAKPOINT]: {
                                    width: '100%',
                                },
                            }
                        }
                    }}
                >
                    <Notifications activeIndex={activeIndex} />
                </Block>
            </Block>
        </Block>
    );
}