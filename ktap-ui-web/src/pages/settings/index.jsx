import React from 'react';
import { Outlet } from "react-router-dom";
import { Block } from 'baseui/block';

import { MOBILE_BREAKPOINT, LAYOUT_SETTINGS_LEFT, LAYOUT_SETTINGS_RIGHT } from '../../constants';

import SideBar from './side-bar';
import TopBar from './top-bar';

function Settings() {
    return (
        <Block display='flex' flexDirection='column' marginTop='scale900' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    [MOBILE_BREAKPOINT]: {
                        marginTop: $theme.sizing.scale600,
                    },
                })
            }
        }}>
            <Block paddingLeft='scale600' paddingRight='scale600' marginBottom='scale900'>
                <TopBar />
            </Block>
            <Block overrides={{
                Block: {
                    style: {
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        [MOBILE_BREAKPOINT]: {
                            flexDirection: 'column',
                        },
                    }
                }
            }}>
                <Block
                    overrides={{
                        Block: {
                            style: ({ $theme }) => ({
                                marginRight: $theme.sizing.scale300,
                                marginBottom: $theme.sizing.scale600,
                                paddingLeft: $theme.sizing.scale600,
                                paddingRight: $theme.sizing.scale600,
                                width: LAYOUT_SETTINGS_LEFT,
                                [MOBILE_BREAKPOINT]: {
                                    width: '100vw',
                                    marginRight: 0,
                                },
                            })
                        }
                    }}
                >
                    <SideBar />
                </Block>
                <Block overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            width: LAYOUT_SETTINGS_RIGHT,
                            marginLeft: $theme.sizing.scale300,
                            maxWidth: '100vw',
                            minHeight: '50vh',
                            [MOBILE_BREAKPOINT]: {
                                margin: '0',
                            }
                        })
                    }
                }}>
                    <Outlet />
                </Block>
            </Block>
        </Block>
    );
}

export default Settings;