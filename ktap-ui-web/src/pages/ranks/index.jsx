import React from 'react';

import { Block } from "baseui/block";
import { LabelSmall } from 'baseui/typography';

import { LAYOUT_DEFAULT, MOBILE_BREAKPOINT } from '@ktap/libs/utils';
import Tabs from '@ktap/components/tabs';

import RankAppsList from './rank-apps-list';
import RankOrganizationsList from './rank-organizations-list';


function Ranks() {
    const [activeTab, setActiveTab] = React.useState(0);

    return (
        <Block display='flex' flexDirection='column' width={LAYOUT_DEFAULT} marginTop='scale900' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    [MOBILE_BREAKPOINT]: {
                        width: '100%',
                        marginTop: $theme.sizing.scale600,
                    }
                })
            }
        }}>
            <Block display='flex' marginBottom='scale600' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            marginTop: $theme.sizing.scale300,
                            marginLeft: $theme.sizing.scale300,
                            marginRight: $theme.sizing.scale300,
                        }
                    })
                }
            }}>
                <Tabs activeKey={activeTab} names={['评分榜', '热门榜', '新品榜', '差评榜', '厂商榜']} onChange={({ activeKey }) => setActiveTab(activeKey)} />
            </Block>
            {/* 都是100个 */}
            <Block overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            margin: $theme.sizing.scale300,
                        }
                    })
                }
            }}>
                {activeTab === 0 &&
                    <>
                        <LabelSmall marginLeft='scale300' color='primary300' marginBottom='scale600'>按评分计算</LabelSmall>
                        <RankAppsList apiUrl='/api/ranks/apps/best' />
                    </>
                }
                {activeTab === 1 &&
                    <>
                        <LabelSmall marginLeft='scale300' color='primary300' marginBottom='scale600'>按评论数量计算</LabelSmall>
                        <RankAppsList apiUrl='/api/ranks/apps/hottest' />
                    </>
                }
                {activeTab === 2 &&
                    <>
                        <LabelSmall marginLeft='scale300' color='primary300' marginBottom='scale600'>按最新时间计算</LabelSmall>
                        <RankAppsList apiUrl='/api/ranks/apps/newest' />
                    </>
                }
                {activeTab === 3 &&
                    <>
                        <LabelSmall marginLeft='scale300' color='primary300' marginBottom='scale600'>按评分倒计算</LabelSmall>
                        <RankAppsList apiUrl='/api/ranks/apps/worst' />
                    </>
                }
                {activeTab === 4 &&
                    <>
                        <LabelSmall marginLeft='scale300' color='primary300' marginBottom='scale600'>按开发和发行综合计算</LabelSmall>
                        <RankOrganizationsList apiUrl='/api/ranks/organizations/best' />
                    </>
                }
            </Block>
        </Block>
    );
}

export default Ranks;