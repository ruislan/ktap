import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LAYOUT_MAIN, MOBILE_BREAKPOINT } from '../../constants';
import DiscussionsList from './discussions-list';
import { useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from 'baseui/skeleton';
import { HeadingMedium, HeadingXSmall } from 'baseui/typography';
import { useAuth } from '../../hooks/use-auth';
import { Button } from 'baseui/button';
import { Check } from 'baseui/icon';

function AppBanner({ appId }) {
    const [css, theme] = useStyletron();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [isFollowed, setIsFollowed] = React.useState(false);

    const handleFollow = async () => {
        if (!user) { navigate('/login'); return; }
        await fetch(`/api/user/follows/apps/${appId}`, { method: isFollowed ? 'DELETE' : 'POST', });
        setIsFollowed(prev => !prev);
    };

    React.useEffect(() => {
        const fetchFollow = async () => {
            if (user) {
                try {
                    const res = await fetch(`/api/user/follows/apps/${appId}`);
                    if (res.ok) {
                        const json = await res.json();
                        setIsFollowed(json?.data?.follow);
                    }
                } catch (e) {
                    setIsFollowed(false);
                }
            }
        }
        fetchFollow();
    }, [user, appId]);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/apps/${appId}/basic`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json.data);
                } else {
                    if (res.status === 404) navigate('/not-found', { replace: true });
                    if (res.status >= 500) navigate('/panic');
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [appId, navigate]);

    return (
        <>{
            isLoading ?
                <Skeleton width='100%' height='152px' animation /> :
                <Block width='100vw' justifyContent='center' display='flex' position='relative' backgroundColor='backgroundSecondary' overflow='hidden'>
                    <Block width='100%' height='100%'
                        overrides={{
                            Block: {
                                style: {
                                    background: `url(${data.media.head.image}) center/cover no-repeat `,
                                    filter: 'blur(60px) brightness(40%)',
                                    position: 'absolute',
                                    opacity: .6,
                                    zIndex: 1,
                                }
                            }
                        }}
                    />
                    <Block width={LAYOUT_MAIN} height='100%' display='flex' overrides={{
                        Block: {
                            style: {
                                zIndex: 2,
                                [MOBILE_BREAKPOINT]: {
                                    flexDirection: 'column',
                                    width: '100%',
                                },
                            }
                        }
                    }}>
                        <Block width='290px' height='136px' marginTop='scale300' marginBottom='scale300' marginRight='scale300' marginLeft='0'
                            overrides={{
                                Block: {
                                    style: {
                                        [MOBILE_BREAKPOINT]: {
                                            display: 'none',
                                        }
                                    }
                                }
                            }}
                        >
                            <img width='100%' height='100%' className={css({
                                borderRadius: theme.borders.radius300,
                            })} src={data.media.head.image} />
                        </Block>
                        <Block display='flex' flexDirection='column' margin='scale300' gridGap='scale100' justifyContent='space-between'>
                            <Block>
                                <HeadingMedium marginTop='0' marginBottom='0' >{data.name}</HeadingMedium>
                                <HeadingXSmall marginTop='0' marginBottom='0' color='primary100' overrides={{
                                    Block: {
                                        style: {
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            lineHeight: '25px',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                            textShadow: '1px 1px 0px rgb(0 0 0 / 50%)',
                                            [MOBILE_BREAKPOINT]: {
                                                marginBottom: theme.sizing.scale600,
                                            }
                                        }
                                    }
                                }}>讨论中心</HeadingXSmall>
                            </Block>
                            <Block>
                                <Button kind='secondary' size='compact' onClick={() => handleFollow()} startEnhancer={isFollowed ? <Check size={16} /> : null}>
                                    {isFollowed ? '已关注' : '关注'}
                                </Button>
                            </Block>
                        </Block>
                    </Block>
                </Block>
        }
        </>
    );
}

function DiscussionsApps() {
    const { appId } = useParams();

    return (
        <Block display='flex' flexDirection='column' alignItems='center'>
            <AppBanner appId={appId} />
            <Block display='flex' flexDirection='column' width={LAYOUT_MAIN} marginTop='scale600' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            width: '100vw',
                            paddingLeft: $theme.sizing.scale300, paddingRight: $theme.sizing.scale300,
                        }
                    })
                }
            }}>
                <DiscussionsList appId={appId} initDiscussionId={1} />
            </Block>
        </Block>
    );
}

export default DiscussionsApps;