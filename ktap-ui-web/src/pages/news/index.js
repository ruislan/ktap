import React from 'react';
import dayjs from 'dayjs';
import { useStyletron } from 'baseui';
import { Block } from "baseui/block";
import { HeadingXSmall, MonoLabelMedium, LabelXSmall, ParagraphSmall } from 'baseui/typography';
import { Button } from "baseui/button";
import { LAYOUT_MAIN, MOBILE_BREAKPOINT } from '../../constants';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from 'baseui/skeleton';

function News() {
    const limit = 20;
    const [css, theme] = useStyletron();
    const navigate = useNavigate();
    const [dataList, setDataList] = React.useState([]);
    const [hasMore, setHasMore] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [skip, setSkip] = React.useState(0);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/news?limit=${limit}&skip=${skip}`);
                if (res.ok) {
                    const json = await res.json();
                    setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                    setHasMore(json.skip + json.limit < json.count);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [skip]);

    return (
        <Block display='flex' flexDirection='column' width={LAYOUT_MAIN} marginTop='scale900' overrides={{
            Block: {
                style: {
                    [MOBILE_BREAKPOINT]: {
                        marginTop: theme.sizing.scale600,
                        width: '100%',
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
                        marginTop: theme.sizing.scale300,
                        marginBottom: theme.sizing.scale300,
                        textDecoration: 'none',
                        borderRadius: theme.sizing.scale300,
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
                    <Block display='flex' flexDirection='column' padding='scale500' overflow='hidden'>
                        <HeadingXSmall overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap' marginTop='0' marginBottom='scale100'>{news.title}</HeadingXSmall>
                        <LabelXSmall marginTop='scale100' color='primary300'>日期：{dayjs(news.updatedAt).format('YYYY 年 M 月 D 日')}</LabelXSmall>
                        <ParagraphSmall flex={1} color='primary100' overrides={{
                            Block: {
                                style: {
                                    display: '-webkit-box',
                                    overflow: 'hidden',
                                    '-webkit-box-orient': 'vertical',
                                    '-webkit-line-clamp': 4,
                                }
                            }
                        }}>{news.summary}</ParagraphSmall>
                        <Block display='flex' alignItems='center'>
                            <Block
                                display='flex'
                                alignItems='center'
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/apps/${news.app.id}`);
                                }}
                                overrides={{
                                    Block: {
                                        style: {
                                            marginLeft: '-4px',
                                            padding: theme.sizing.scale100,
                                            ':hover': {
                                                backgroundColor: 'rgba(109, 109, 109, 0.3)',
                                                borderRadius: theme.borders.radius200
                                            }
                                        }
                                    }
                                }}>
                                <img src={news.app.logo} width='18px' height='18px' className={css({
                                    borderRadius: theme.borders.radius100,
                                })} />
                                <MonoLabelMedium marginLeft='scale300' marginRight='scale0' color='primary200'>{news.app.name}</MonoLabelMedium>
                            </Block>
                        </Block>
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
            {isLoading && <Block display='flex' flexDirection='column' gridGap='scale600' justifyContent='center'>
                <Skeleton animation height='212px' width='100%' />
                <Skeleton animation height='212px' width='100%' />
                <Skeleton animation height='212px' width='100%' />
            </Block>}
            {hasMore && !isLoading &&
                <Block marginTop='scale600' display='flex' justifyContent='center' alignItems='center'>
                    <Button onClick={() => setSkip(prev => prev + limit)} kind='tertiary'>
                        查看更多
                    </Button>
                </Block>
            }
        </Block >
    );
}

export default News;