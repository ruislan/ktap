import { useStyletron } from 'baseui';
import { Outlet } from 'react-router-dom';

import { Block } from 'baseui/block';

import { MOBILE_BREAKPOINT, LAYOUT_SETTINGS_SIDE, LAYOUT_SETTINGS_CONTENT } from '../../libs/utils';

import SideBar from './side-bar';
import TopBar from './top-bar';


function Settings() {
    const [, theme] = useStyletron();
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
                <Block width={LAYOUT_SETTINGS_SIDE} marginBottom='scale600'
                    overrides={{
                        Block: {
                            style: {
                                [MOBILE_BREAKPOINT]: {
                                    width: '100vw',
                                },
                            }
                        }
                    }}
                >
                    <SideBar />
                </Block>
                <Block maxWidth='100vw' minHeight='50vh' width={LAYOUT_SETTINGS_CONTENT} overrides={{
                    Block: {
                        style: {
                            [MOBILE_BREAKPOINT]: {
                                margin: '0',
                            }
                        }
                    }
                }}>
                    <Outlet />
                </Block>
            </Block>
        </Block>
    );
}

export default Settings;