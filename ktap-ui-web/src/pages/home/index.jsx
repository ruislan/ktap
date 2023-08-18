import { Block } from 'baseui/block';

import { MOBILE_BREAKPOINT, LAYOUT_DEFAULT_CONTENT, LAYOUT_DEFAULT_SIDE } from '@ktap/libs/utils';
import SideBoxApps from '@ktap/components/side-box-apps';

import AppListRecommended from './app-list-recommended';

function Home() {
    return (
        <Block display='flex' marginTop='scale900' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    [MOBILE_BREAKPOINT]: {
                        width: 'auto',
                        flexDirection: 'column',
                        marginTop: $theme.sizing.scale600,
                    }
                })
            }
        }}>
            <Block overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        marginRight: $theme.sizing.scale300,
                        width: LAYOUT_DEFAULT_CONTENT,
                        display: 'flex',
                        flexDirection: 'column',
                        [MOBILE_BREAKPOINT]: {
                            width: 'auto',
                            marginLeft: $theme.sizing.scale300,
                            marginTop: $theme.sizing.scale300,
                        }
                    })
                }
            }}>
                <AppListRecommended />
            </Block>

            <Block overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: { width: 'auto', marginRight: $theme.sizing.scale300, marginTop: $theme.sizing.scale600 },
                        width: LAYOUT_DEFAULT_SIDE,
                        marginLeft: $theme.sizing.scale300,
                        display: 'flex',
                        flexDirection: 'column',
                    })
                }
            }}>
                {/* 热门游戏 */}
                <SideBoxApps title='热门游戏' apiUrl='/api/apps/by-hot' />
                {/* 最近更新 */}
                <SideBoxApps title='最近更新' apiUrl='/api/apps/by-updated' />
                {/* 注意，如果父层overflow为hidden，则sticky可能无效 */}
                <Block marginBottom='scale900' position='sticky' top='scale800'><SideBoxApps title='最多评价' apiUrl='/api/apps/by-review' /></Block>
                {/* 其他什么推荐之类的 */}
            </Block>
        </Block>
    );
}

export default Home;
