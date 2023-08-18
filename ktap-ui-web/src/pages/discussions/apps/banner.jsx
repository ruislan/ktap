import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Skeleton } from 'baseui/skeleton';
import { HeadingMedium, HeadingXSmall } from 'baseui/typography';
import { Button } from 'baseui/button';
import { Check } from 'baseui/icon';

import { useAuth } from '@ktap/hooks/use-auth';
import { LAYOUT_DEFAULT, MOBILE_BREAKPOINT } from '@ktap/libs/utils';

export default function Banner() {
    const { appId } = useParams();
    const [css, theme] = useStyletron();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [isFollowed, setIsFollowed] = React.useState(false);

    const handleFollow = async () => {
        if (!user) { navigate(`/login?from=${location.pathname}`); return; }
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
                    throw { status: res.status };
                }
            } catch (error) {
                if (error?.status === 404) navigate('/discussions', { replace: true });
                else navigate('/not-work');
            } finally {
                setIsLoading(false);
            }
        })();
    }, [appId, navigate]);

    if (isLoading) return <Skeleton width='100vw' height='152px' animation />;

    return (
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
            <Block width={LAYOUT_DEFAULT} height='100%' display='flex' overrides={{
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
                        <HeadingMedium marginTop='0' marginBottom='0'>{data.name}</HeadingMedium>
                        <HeadingXSmall marginTop='0' marginBottom='0' color='primary100' overrides={{
                            Block: {
                                style: {
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    lineHeight: '25px',
                                    whiteSpace: 'normal',
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
    );
}