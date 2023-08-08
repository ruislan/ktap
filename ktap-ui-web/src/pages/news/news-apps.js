import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStyletron } from 'baseui';
import { Block } from "baseui/block";
import { Skeleton } from 'baseui/skeleton';
import { HeadingXSmall, HeadingMedium } from 'baseui/typography';
import { Button } from "baseui/button";
import { Check } from 'baseui/icon';
import { LAYOUT_MAIN, MOBILE_BREAKPOINT, PAGE_LIMIT_NORMAL } from '../../constants';
import { useAuth } from '../../hooks/use-auth';
import NewsItem from './news-item';
import LoadMore from '../../components/load-more';

function NewsAppsBanner({ appId }) {
    const [css, theme] = useStyletron();
    const { user } = useAuth();
    const navigate = useNavigate();

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
                if (error?.status === 404) navigate('/not-found', { replace: true });
                else navigate('/not-work');
            } finally {
                setIsLoading(false);
            }
        })();
    }, [appId, navigate]);

    if (isLoading) return <Block width='100vw'><Skeleton width='100%' height='152px' animation /></Block>;
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
                <Block display='flex' flexDirection='column' margin='scale300' justifyContent='space-between'>
                    <Block>
                        <HeadingMedium marginTop='0' marginBottom='scale100' >{data.name}</HeadingMedium>
                        <HeadingXSmall marginTop='0' marginBottom='scale100' color='primary100' overrides={{
                            Block: {
                                style: {
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    lineHeight: '25px',
                                    textShadow: '1px 1px 0px rgb(0 0 0 / 50%)',
                                    [MOBILE_BREAKPOINT]: {
                                        marginBottom: theme.sizing.scale600,
                                    }
                                }
                            }
                        }}>新闻中心</HeadingXSmall>
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

function NewsAppsNewsList({ appId }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [, theme] = useStyletron();
    const [dataList, setDataList] = React.useState([]);
    const [hasMore, setHasMore] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [skip, setSkip] = React.useState(0);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/news/apps/${appId}?limit=${limit}&skip=${skip}`);
                if (res.ok) {
                    const json = await res.json();
                    setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                    setHasMore(json.skip + json.limit < json.count);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [appId, skip, limit]);

    return (
        <Block display='flex' flexDirection='column' width={LAYOUT_MAIN} marginTop='scale600' overrides={{
            Block: {
                style: {
                    [MOBILE_BREAKPOINT]: {
                        width: 'auto',
                        marginLeft: theme.sizing.scale300,
                        marginRight: theme.sizing.scale300,
                    }
                }
            }
        }}>
            {dataList && dataList.map((news, index) => <NewsItem key={index} news={news} />)}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='212px' onClick={() => setSkip(prev => prev + limit)} />
        </Block >
    );
}

function NewsApps() {
    const { appId } = useParams();
    return (
        <Block display='flex' flexDirection='column' alignItems='center'>
            <NewsAppsBanner appId={appId} />
            <NewsAppsNewsList appId={appId} />
        </Block>
    );
}

export default NewsApps;