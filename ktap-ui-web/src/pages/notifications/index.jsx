import { Block } from "baseui/block";
import { LabelMedium } from "baseui/typography";
import { Navigation } from 'baseui/side-navigation';

import { LAYOUT_DEFAULT_CONTENT, LAYOUT_DEFAULT_SIDE, MOBILE_BREAKPOINT } from '@ktap/libs/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Tabs from '@ktap/components/tabs';
import NotificationList from './list';

// popover view has a top bar
function PopoverLayout() {
    return (
        <Block display='flex' flexDirection='column'>
            <Block >
                <LabelMedium marginBottom='scale600'>通知中心</LabelMedium>
            </Block>
            <NotificationList />
        </Block>
    );
}

const menus = [
    { title: '系统通知', itemId: '/notifications' },
    { title: '关注通知', itemId: '/notifications?type=following' },
    { title: '互动通知', itemId: '/notifications?type=interaction' },
];
// full view has a side bar
function FullLayout() {
    const navigate = useNavigate();
    return (
        <Block marginTop='scale900' display='flex' justifyContent='center' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    [MOBILE_BREAKPOINT]: {
                        flexDirection: 'column', width: '100%',
                        marginTop: $theme.sizing.scale600,
                    }
                })
            }
        }}>
            <Block width={LAYOUT_DEFAULT_SIDE} margin={'0 8px 0 0'} overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            margin: '0',
                            padding: $theme.sizing.scale300,
                            maxWidth: '100vw',
                        }
                    })
                }
            }}>
                <Navigation items={menus} />
            </Block>
            <Block width={LAYOUT_DEFAULT_CONTENT} margin={'0 0 0 8px'}
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
                <Tabs activeKey={useSearchParams()[0].get('tab')} names={menus.map(m => m.title)} onChange={e => navigate('/notifications?tab=' + e.activeKey)} />
                <NotificationList />
            </Block>
        </Block>
    );
}

function Notification({ kind = 'full' }) {
    if (kind === 'popover') return <PopoverLayout />;
    return <FullLayout />;
}

export default Notification;