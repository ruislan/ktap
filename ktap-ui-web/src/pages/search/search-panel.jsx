import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Input } from 'baseui/input';
import { ArrowRight } from 'baseui/icon';
import { LabelXSmall, LabelMedium } from 'baseui/typography';

import { MOBILE_BREAKPOINT, PAGE_LIMIT_NORMAL } from '@ktap/libs/utils';
import Tag from '@ktap/components/tag';
import { FatSearch, Icon, Star } from '@ktap/components/icons';
import Capsule from '@ktap/components/capsule';
import LoadMore from '@ktap/components/load-more';

function SearchInput({ initKeyword = '' }) {
    const navigate = useNavigate();
    const [word, setWord] = React.useState(initKeyword);
    return (
        <Block flex='1'>
            <Input value={word} size='default' clearable placeholder='搜一搜'
                overrides={{
                    StartEnhancer: {
                        style: () => ({
                            paddingLeft: '0px'
                        })
                    }
                }}
                startEnhancer={<Icon><FatSearch /></Icon>}
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
    );
}

function SearchPanel() {
    const limit = PAGE_LIMIT_NORMAL;
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(false);
    const [dataList, setDataList] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const [count, setCount] = React.useState(0);

    const ref = React.useRef(null);

    const fetchData = React.useCallback(async (skip = 0) => {
        const keyword = searchParams.get('q') || '';
        setSkip(skip);
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
    }, [searchParams, limit]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <>
            <SearchInput initKeyword={searchParams.get('q') || ''} />
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
                <LabelXSmall color='primary300'>共 {count} 个匹配的搜索结果</LabelXSmall>
            </Block>

            <Block ref={ref} display='flex' flexDirection='column' marginTop='scale300' gridGap='scale300'>
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
                                <Icon><Star /></Icon>
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

                <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='86px' onClick={() => fetchData(skip + limit)} />
            </Block>
        </>
    );
}

export default SearchPanel;