import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Block } from 'baseui/block';
import { Check } from 'baseui/icon';
import { Navigation } from 'baseui/side-navigation';
import { HeadingSmall, LabelMedium, LabelSmall } from 'baseui/typography';

import { LAYOUT_SETTINGS_CONTENT, LAYOUT_SETTINGS_SIDE, MOBILE_BREAKPOINT, MOBILE_BREAKPOINT_PX } from '@ktap/libs/utils';
import Tabs from '@ktap/components/tabs';
import RouterLink from '@ktap/components/router-link';
import { TrashBin } from '@ktap/components/icons';

import NotificationList from './list';
import { MENU_ITEMS } from './constants';
import ActionButton from './action-button';
import useWindowSize from '@ktap/hooks/use-window-size';
import { useStyletron } from 'baseui';

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
            <RouterLink kind='underline' href='/notifications'><LabelSmall>设置</LabelSmall></RouterLink>
        </Block>
    );
});

const TitleActionBar = function TitleActionBar({ title, activeIndex }) {
    return (
        <Block display='flex' alignItems='center' color='primary300' marginTop='scale300' marginBottom='scale300'
            paddingLeft='scale300' paddingRight='scale300' paddingBottom='scale300' justifyContent='space-between'
            overrides={{
                Block: {
                    style: {
                        borderBottom: '2px solid rgb(61,61,61)',
                    }
                }
            }}>
            <LabelMedium>{title}</LabelMedium>
            <Block display='flex' alignItems='center' gridGap='scale300'>
                <ActionButton color='inherit' title='全部清空'><TrashBin width='15px' height='15px' /></ActionButton>
                <ActionButton color='inherit' ><Check title='全部标记为已读' $size='scale800' /></ActionButton>
            </Block>
        </Block>
    );
}

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
                    <TitleActionBar title={MENU_ITEMS[activeIndex].title + '通知'} activeIndex={activeIndex} />
                    <NotificationList activeIndex={activeIndex} />
                </Block>
            </Block>
        </Block>
    );
}