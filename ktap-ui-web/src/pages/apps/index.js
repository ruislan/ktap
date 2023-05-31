import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Block } from 'baseui/block';
import { HeadingMedium, ParagraphSmall } from 'baseui/typography';
import { Tabs, Tab } from 'baseui/tabs-motion';
import { Skeleton } from 'baseui/skeleton';
import { StyledLink } from 'baseui/link';
import { MOBILE_BREAKPOINT, LAYOUT_LEFT, LAYOUT_RIGHT } from '../../constants';
import SideBoxApps from '../../components/side-box-apps';
import Glance from './glance';
import MetaBar from './meta-bar';
import SideContact from './side-contact';
import SideAward from './side-award';
import Highlight from './highlight';
import TabDetailsDescription from './tab-details-description';
import TabDetailsLanguages from './tab-details-languages';
import TabDetailsNews from './tab-details-news';
import TabDetailsRequirements from './tab-details-requirements';
import TabReviewsProfessional from './tab-reviews-professional';
import TabReviewsUsers from './tab-reviews-users';

function App() {
    const urlParams = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const [app, setApp] = React.useState(null);
    const [meta, setMeta] = React.useState(null);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/apps/${urlParams.id}`);
                if (res.ok) {
                    const json = await res.json();
                    setApp(json.data);
                    setMeta(json.meta);
                } else {
                    if (res.status === 404) navigate('/not-found', { replace: true });
                    if (res.status >= 500) navigate('/panic');
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [urlParams.id, navigate]);

    return (
        <Block padding='0' marginTop='scale900' overrides={{
            Block: {
                style: {
                    [MOBILE_BREAKPOINT]: {
                        width: '100%',
                    },
                }
            }
        }}>
            <HeadingMedium marginTop='0' marginBottom='scale850' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            fontSize: $theme.sizing.scale700,
                            lineHeight: $theme.sizing.scale800,
                            paddingLeft: $theme.sizing.scale300,
                            paddingRight: $theme.sizing.scale300,
                            marginBottom: $theme.sizing.scale600,
                            marginTop: $theme.sizing.scale600,
                        }
                    })
                }
            }}>
                {app?.name}
            </HeadingMedium>

            <Block display='flex' justifyContent='center' overrides={{
                Block: {
                    style: {
                        [MOBILE_BREAKPOINT]: {
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                        },
                    }
                }
            }}>
                {/* app media swiper */}
                <Block width={LAYOUT_LEFT} margin={'0 8px 0 0'} overrides={{
                    Block: {
                        style: {
                            [MOBILE_BREAKPOINT]: {
                                margin: '0',
                                width: '100vw',
                                gridArea: '2 / 1',
                            }
                        }
                    }
                }}>
                    {isLoading ?
                        <Block>
                            <Skeleton width="100%" height="343px" animation /><Block height='8px' />
                            <Skeleton width="100%" height="65px" animation /><Block height='8px' />
                            <Skeleton width="100%" height="72px" animation /><Block height='24px' />
                            <Skeleton width="100%" height="36px" animation />
                        </Block> :
                        app && <Highlight data={app} />
                    }
                </Block>
                {/* app summary */}
                <Block width={LAYOUT_RIGHT} margin='0 0 0 8px'
                    overrides={{
                        Block: {
                            style: {
                                [MOBILE_BREAKPOINT]: {
                                    width: 'auto',
                                    margin: '0 0 16px'
                                },
                            }
                        }
                    }}
                >
                    {isLoading ?
                        <Block>
                            <Skeleton width="100%" height="151px" animation /><Block height='16px' />
                            <Skeleton width="100%" height="68px" animation /><Block height='16px' />
                            <Skeleton width="100%" height="104px" animation /><Block height='16px' />
                            <Skeleton width="100%" height="185px" animation />
                        </Block> :
                        app && <Glance data={app} />
                    }
                </Block>
            </Block>

            {/* app meta */}
            {isLoading ?
                <Block marginTop='scale900' marginBottom='scale900'>
                    <Skeleton width="100%" height="77.5px" animation />
                </Block>
                :
                meta && <MetaBar meta={meta} />
            }

            <Block overrides={{
                Block: {
                    style: {
                        display: 'flex',
                        justifyContent: 'center',
                        margin: '16px 0',
                        [MOBILE_BREAKPOINT]: {
                            width: 'auto',
                            flexDirection: 'column',
                        },
                    }
                }
            }}>
                <Block width={LAYOUT_LEFT} margin={['0', '0', '0 8px 0 0', '0 8px 0 0']} overrides={{
                    Block: {
                        style: {
                            [MOBILE_BREAKPOINT]: {
                                width: '100%',
                                margin: '0'
                            }
                        }
                    }
                }} >
                    <Tabs
                        activeKey={activeTab}
                        onChange={({ activeKey }) => setActiveTab(activeKey)}
                        fill='fixed'
                        activateOnFocus
                    >
                        <Tab title="详情">
                            {app && <TabDetailsNews app={app} />}
                            {isLoading ?
                                <Skeleton width="100%" height="800px" animation />
                                :
                                app && <>
                                    <TabDetailsDescription app={app} />
                                    <TabDetailsRequirements app={app} />
                                    <TabDetailsLanguages app={app} />
                                    {app?.legalText && <ParagraphSmall color='primary300' marginTop='scale1200'>
                                        {app?.legalUrl ? <StyledLink href={app.legalUrl || '#'} target='_blank'>
                                            {app.legalText}
                                        </StyledLink> : app.legalText}
                                    </ParagraphSmall>}
                                </>
                            }
                        </Tab>
                        <Tab title="评测">
                            {isLoading ?
                                <Skeleton width="100%" height="800px" animation />
                                :
                                app && <>
                                    <TabReviewsProfessional app={app} />
                                    <TabReviewsUsers app={app} />
                                </>
                            }
                        </Tab>
                        {/* <Tab title="攻略">V2:这里就是把帖子里面标记为攻略的放过来？</Tab>
                        <Tab title="论坛">V2:这里就是把论坛里面相关的最新的帖子放过来？</Tab>
                        <Tab title="素材">V2:这里展示一些壁纸，LOGO，图片，视频等等？</Tab> */}
                    </Tabs>
                </Block>
                <Block width={LAYOUT_RIGHT} marginLeft='scale300' overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            [MOBILE_BREAKPOINT]: {
                                width: 'auto',
                                marginRight: $theme.sizing.scale300,
                            },
                        })
                    }
                }}>
                    {isLoading ?
                        <Block marginBottom='scale900'>
                            <Skeleton width="100%" height="280px" animation />
                        </Block>
                        :
                        app && <SideContact socialLinks={app.socialLinks} />
                    }
                    {app?.awards && app.awards.length > 0 && <SideAward app={app} />}
                    <Block marginBottom='scale900' position='sticky' top='scale800'>
                        <SideBoxApps title='相关游戏' apiUrl={`/api/apps/${urlParams.id}/related`} />
                    </Block>
                </Block>
            </Block>
        </Block >
    );
}

export default App;