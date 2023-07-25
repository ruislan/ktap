import React from 'react';
import { useStyletron } from 'baseui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Block } from 'baseui/block';
import { Input } from 'baseui/input';
import { ArrowRight, Search as SearchIcon } from 'baseui/icon';
import { MOBILE_BREAKPOINT } from '../../constants';
import { LabelXSmall, LabelMedium } from 'baseui/typography';
import Tag from '../../components/tag';
import { Star } from '../../components/icons';
import Capsule from '../../components/capsule';
import { Skeleton } from 'baseui/skeleton';
import { Button } from 'baseui/button';


function SearchPanel() {
    const limit = 20;
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(false);
    const [dataList, setDataList] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const [count, setCount] = React.useState(0);
    const [word, setWord] = React.useState('');
    const ref = React.useRef(null);

    React.useEffect(() => {
        setSkip(0);
        setDataList([]);
    }, [searchParams])

    React.useEffect(() => {
        (async () => {
            const keyword = searchParams.get('q') || '';
            setWord(keyword);
            setIsLoading(true);
            try {
                const result = await fetch(`/api/search/apps?keyword=${keyword}&skip=${skip}&limit=${limit}`);
                const json = await result.json();
                setCount(json.count);
                setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                setHasMore(json.skip + json.limit < json.count);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [skip, searchParams]);

    // React.useEffect(() => {
    //     if (isLoading || !hasMore) return;
    //     // const handleScroll = () => {
    //     //     if (window.innerHeight + document.documentElement.scrollTop + 100 < document.documentElement.offsetHeight) {
    //     //         return;
    //     //     }
    //     //     setSkip(prev => prev + limit);
    //     // };
    //     // window.addEventListener("scroll", handleScroll);
    //     // return () => window.removeEventListener("scroll", handleScroll);
    //     const observer = new IntersectionObserver((entries) => {
    //         // 如果 intersectionRatio 为 0，则目标在视野外，
    //         // 我们不需要做任何事情。
    //         if (entries[0].intersectionRatio <= 0) return;
    //         setSkip(prev => prev + limit);
    //         console.log('Loaded new items');
    //     });

    //     let el = null;
    //     if (ref.current) {
    //         el = ref.current;
    //         observer.observe(el);
    //     }

    //     return () => {
    //         if (el) observer.unobserve(el);
    //     }
    // }, [dataList, isLoading, hasMore]);

    return (
        <>
            <Block display='flex' alignItems='center' justifyContent='space-between'>
                <Block overrides={{
                    Block: {
                        style: {
                            flex: 1,
                        }
                    }
                }}>
                    <Input value={word} size='default' clearable placeholder='搜一搜'
                        overrides={{
                            StartEnhancer: {
                                style: () => ({
                                    paddingLeft: '0px'
                                })
                            }
                        }}
                        startEnhancer={<SearchIcon size='scale800' />}
                        endEnhancer={<ArrowRight cursor='pointer' onClick={() => { navigate(`/search?q=${word}`, { replace: true }); }} size='scale800' />}
                        onChange={e => setWord(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                navigate(`/search?q=${word}`, { replace: true });
                            }
                        }}
                    />
                </Block>
            </Block>


            <Block
                overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            marginTop: $theme.sizing.scale300,
                            padding: $theme.sizing.scale300,
                            backgroundColor: $theme.colors.backgroundSecondary,
                            borderRadius: $theme.borders.radius300,
                        })
                    }
                }}
            >
                <LabelXSmall color='primary300'>{count}个匹配的搜索结果。</LabelXSmall>
            </Block>

            <Block ref={ref} display='flex' flexDirection='column' marginTop='scale300'>
                {dataList.map((app, index) => (
                    <Capsule key={index} href={`/apps/${app.id}`}>
                        <Block width='154px' height='86.5px'>
                            <img src={app.media.landscape.thumbnail} className={css({ width: '100%', height: '100%', borderRadius: theme.sizing.scale100 })} />
                        </Block>
                        <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600' paddingTop='scale100' flex={1} overflow='auto'
                            overrides={{
                                Block: {
                                    style: {
                                        [MOBILE_BREAKPOINT]: {
                                            paddingLeft: theme.sizing.scale300,
                                            paddingRight: theme.sizing.scale300,
                                        }
                                    }
                                }
                            }}>
                            <LabelMedium marginBottom='scale100'>{app.name}</LabelMedium>
                            <Block display='flex' alignItems='center' overrides={{
                                Block: {
                                    style: {
                                        [MOBILE_BREAKPOINT]: {
                                            alignSelf: 'start',
                                        }
                                    }
                                }
                            }}>
                                <LabelMedium marginRight='scale0'>{app.score}</LabelMedium>
                                <Star width='20px' height='20px' />
                            </Block>
                            <Block display='flex' gridGap='scale300' overflow='auto' alignItems='center' marginTop='scale300'>
                                {app.tags && app.tags.map((tag, index) => {
                                    return (
                                        <Tag key={index} closeable={false}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                navigate(`/tags/${tag.name}`);
                                            }}
                                        >
                                            {tag.name}
                                        </Tag>
                                    )
                                })}
                            </Block>
                        </Block>
                    </Capsule>
                ))}
                {isLoading && <Block display='flex' flexDirection='column' marginTop='scale300' marginBottom='scale300' gridGap='scale300' justifyContent='center'>
                    <Skeleton animation height='86px' width='100%' />
                    <Skeleton animation height='86px' width='100%' />
                    <Skeleton animation height='86px' width='100%' />
                </Block>}
                {hasMore && !isLoading &&
                    <Block marginTop='scale800' display='flex' justifyContent='center'>
                        <Button size='default' kind='tertiary' onClick={() => setSkip(prev => prev + limit)}>
                            查看更多
                        </Button>
                    </Block>
                }
            </Block>
        </>
    );
}

export default SearchPanel;