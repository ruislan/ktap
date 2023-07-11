import React from 'react';
import dayjs from 'dayjs';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStyletron } from 'baseui';
import { Block } from "baseui/block";
import { Skeleton } from 'baseui/skeleton';
import { HeadingXSmall, LabelXSmall, ParagraphSmall, HeadingMedium } from 'baseui/typography';
import { Button } from "baseui/button";
import { LAYOUT_MAIN, MOBILE_BREAKPOINT } from '../../constants';
import { useAuth } from '../../hooks/use-auth';
import { Check } from 'baseui/icon';

function NewsAppsBanner({ appId }) {
    const [css, theme] = useStyletron();
    const { user } = useAuth();
    const navigate = useNavigate();

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
                    if (res.status >= 500) throw new Error();
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
                        <Block display='flex' flexDirection='column' margin='scale300' justifyContent='space-between'>
                            <Block>
                                <HeadingMedium marginTop='0' marginBottom='scale100' >{data.name}</HeadingMedium>
                                <HeadingXSmall marginTop='0' marginBottom='scale100' color='primary100' overrides={{
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
        }
        </>
    );
}

function NewsAppsNewsList({ appId }) {
    const limit = 20;
    const [css, theme] = useStyletron();
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
    }, [skip, appId]);

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
            {dataList && dataList.map((news, index) => (
                <Link key={index}
                    to={`/news/${news.id}`}
                    className={css({
                        [MOBILE_BREAKPOINT]: {
                            flexDirection: 'column',
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                        },
                        display: 'flex',
                        justifyContent: 'space-between',
                        backgroundColor: theme.colors.backgroundSecondary,
                        marginTop: theme.sizing.scale600,
                        marginBottom: theme.sizing.scale600,
                        textDecoration: 'none',
                        borderRadius: theme.borders.radius300,
                        boxShadow: '2px 2px 12px 2px rgb(0 0 0 / 0%)',
                        transition: 'box-shadow .24s ease-in-out',
                        ':first-child': {
                            marginTop: 0,
                        },
                        ':hover': {
                            boxShadow: '2px 2px 12px 2px rgb(0 0 0 / 50%)',
                            backgroundColor: 'rgba(109, 109, 109, 0.3)',
                        }
                    })}
                >
                    <Block display='flex' flexDirection='column' padding='scale500'>
                        <HeadingXSmall marginTop='0' marginBottom='scale100'>{news.title}</HeadingXSmall>
                        <LabelXSmall marginTop='scale100' color='primary300'>日期：{dayjs(news.updatedAt).format('YYYY 年 M 月 D 日')}</LabelXSmall>
                        <ParagraphSmall color='primary100' overrides={{
                            Block: {
                                style: {
                                    display: '-webkit-box',
                                    overflow: 'hidden',
                                    '-webkit-box-orient': 'vertical',
                                    '-webkit-line-clamp': 4,
                                }
                            }
                        }}>{news.summary}</ParagraphSmall>
                    </Block>
                    <Block
                        padding='scale500'
                        width='350px'
                        minWidth='350px'
                        overrides={{
                            Block: {
                                style: () => ({
                                    [MOBILE_BREAKPOINT]: {
                                        width: '100%',
                                        padding: '0',
                                        gridArea: '1 / 1',
                                    }
                                })
                            }
                        }}
                    >
                        <img src={news.head} width='100%' height='100%' className={css({
                            borderRadius: theme.borders.radius300,
                            [MOBILE_BREAKPOINT]: {
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                            }
                        })} />
                    </Block>
                </Link>
            ))}
            <Block marginTop='scale600' display='flex' justifyContent='center' alignItems='center'>
                {dataList.length > 0 &&
                    <Button onClick={() => setSkip(prev => prev + limit)} kind='tertiary' isLoading={isLoading} disabled={!hasMore}>
                        {hasMore ? '查看更多' : '没有了'}
                    </Button>
                }
            </Block>
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