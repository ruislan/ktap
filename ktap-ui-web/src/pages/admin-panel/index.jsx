import { Outlet } from 'react-router-dom';

import { Block } from 'baseui/block';
import { SnackbarProvider } from 'baseui/snackbar';

import { MOBILE_BREAKPOINT, LAYOUT_ADMIN_LEFT, LAYOUT_ADMIN_RIGHT } from '@ktap/libs/utils';

import SideBar from './side-bar';

function AdminPanel() {
    return (
        <Block marginTop='scale900' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    display: 'flex', justifyContent: 'center', flexDirection: 'row',
                    [MOBILE_BREAKPOINT]: {
                        flexDirection: 'column', justifyContent: 'flex-start', marginTop: $theme.sizing.scale600,
                    },
                })
            }
        }}>
            <Block overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        marginRight: $theme.sizing.scale300, marginBottom: $theme.sizing.scale600,
                        paddingLeft: $theme.sizing.scale600, paddingRight: $theme.sizing.scale600,
                        width: LAYOUT_ADMIN_LEFT,
                        [MOBILE_BREAKPOINT]: {
                            width: '100vw', marginRight: 0, marginBottom: $theme.sizing.scale300,
                        },
                    })
                }
            }}>
                <SideBar />
            </Block>
            <Block overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        width: LAYOUT_ADMIN_RIGHT, marginLeft: $theme.sizing.scale300, maxWidth: '100vw', minHeight: '50vh',
                        [MOBILE_BREAKPOINT]: { margin: '0', }
                    })
                }
            }}>
                <SnackbarProvider>
                    <Outlet />
                </SnackbarProvider>
            </Block>
        </Block>
    );
}

export default AdminPanel;