import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from "baseui/block";
import { LabelXSmall, LabelSmall, LabelMedium } from 'baseui/typography';
import { Button } from "baseui/button";
import { LAYOUT_MAIN, MOBILE_BREAKPOINT, PAGE_LIMIT_NORMAL } from '../../constants';
import { Link } from 'react-router-dom';
import { Input } from 'baseui/input';
import { ArrowRight, Search as SearchIcon } from 'baseui/icon';
import { ChatAlt2, User } from '../../components/icons';
import { Skeleton } from 'baseui/skeleton';

function Discussions() {
    const limit = PAGE_LIMIT_NORMAL + 1;
    const [css, theme] = useStyletron();
    const [dataList, setDataList] = React.useState([]);
    const [hasMore, setHasMore] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [skip, setSkip] = React.useState(0);
    const keywordRef = React.useRef();

    const fetchData = React.useCallback(async (skip = 0) => {
        setIsLoading(true);
        setSkip(skip);
        try {
            const res = await fetch(`/api/discussions?keyword=${keywordRef.current.value || ''}&limit=${limit}&skip=${skip}`);
            if (res.ok) {
                const json = await res.json();
                setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                setHasMore(json.skip + json.limit < json.count);
            }
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <Block display='flex' flexDirection='column' width={LAYOUT_MAIN} marginTop='scale900' overrides={{
            Block: {
                style: {
                    [MOBILE_BREAKPOINT]: {
                        width: '100%', marginTop: theme.sizing.scale600,
                        marginLeft: theme.sizing.scale300, marginRight: theme.sizing.scale300,
                    }
                }
            }
        }}>
            {/* TODO 这里加个大背景？ */}
            <Block display='flex' justifyContent='center' alignItems='center' marginBottom='scale900' gridGap='scale300'>
                <Input inputRef={keywordRef} size='default' placeholder='搜索感兴趣的游戏讨论...'
                    onKeyUp={e => e.key === 'Enter' && fetchData()}
                    startEnhancer={<SearchIcon size='scale800' />}
                    endEnhancer={<ArrowRight cursor='pointer' onClick={() => fetchData()} size='scale800' />}
                />
            </Block>
            <Block display='grid' gridTemplateColumns='repeat(auto-fill,minmax(240px,1fr))' gridGap='scale600'>
                {dataList && dataList.map((app, index) => (
                    <Link key={index} to={`/discussions/apps/${app.id}`} className={css({
                        textDecoration: 'none',
                        display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative',
                        backgroundColor: theme.colors.backgroundSecondary, height: '320px',
                        borderRadius: theme.borders.radius300,
                        boxShadow: theme.lighting.shadow700,
                    })}>
                        <div className={css({
                            width: '100%', paddingBottom: theme.sizing.scale800, position: 'relative',
                        })}>
                            <div className={css({
                                width: '100%', height: '138px',
                                borderTopLeftRadius: theme.borders.radius300, borderTopRightRadius: theme.borders.radius300,
                                backgroundImage: `url(${app.media?.head?.image})`,
                                backgroundPosition: 'center center', backgroundSize: 'cover',
                            })} />
                            <div className={css({
                                backgroundColor: theme.colors.backgroundPrimary, padding: theme.sizing.scale100, marginLeft: theme.sizing.scale500,
                                position: 'absolute', bottom: theme.sizing.scale100, borderRadius: theme.borders.radius300,
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                            })}>
                                <img src={app.media?.logo?.image} className={css({ objectFit: 'cover', borderRadius: theme.borders.radius300, width: theme.sizing.scale1200, height: theme.sizing.scale1200 })} alt={app.name} />
                            </div>
                        </div>
                        <div className={css({
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.sizing.scale600,
                            paddingLeft: theme.sizing.scale600, paddingRight: theme.sizing.scale600, paddingBottom: theme.sizing.scale600,
                            paddingTop: theme.sizing.scale300, overflow: 'hidden', width: '100%', flex: '1'
                        })}>
                            <Block display='flex' flexDirection='column' gridGap='scale300' width='100%' flex='1' marginBottom='scale300'>
                                <LabelMedium>{app.name}</LabelMedium>
                                <LabelSmall color='primary300' width='100%' overflow='hidden' textOverflow='ellipsis' overrides={{
                                    Block: {
                                        style: {
                                            display: '-webkit-box',
                                            '-webkit-box-orient': 'vertical',
                                            '-webkit-line-clamp': 4,
                                        }
                                    }
                                }}>{app.summary}</LabelSmall>
                            </Block>
                            <Block display='flex' justifyContent='space-between' alignItems='center' width='100%'>
                                <LabelXSmall color='primary300' display='flex' alignItems='center' gridGap='scale0'><User width='16px' height='16px' />{app?.meta?.users} 人参与</LabelXSmall>
                                <LabelXSmall color='primary300' display='flex' alignItems='center' gridGap='scale0'><ChatAlt2 width='16px' height='16px' /> {app?.meta?.discussions} 个讨论</LabelXSmall>
                            </Block>
                        </div>
                    </Link>
                ))}
            </Block>
            {isLoading && <Block display='grid' gridTemplateColumns='repeat(auto-fill,minmax(240px,1fr))' gridGap='scale600'>
                <Skeleton animation height='320px' width='100%' />
                <Skeleton animation height='320px' width='100%' />
                <Skeleton animation height='320px' width='100%' />
            </Block>}
            {hasMore && !isLoading &&
                <Block marginTop='scale600' display='flex' justifyContent='center' alignItems='center'>
                    <Button onClick={() => fetchData(skip + limit)} kind='tertiary'>查看更多</Button>
                </Block>
            }
        </Block >
    );
}

export default Discussions;