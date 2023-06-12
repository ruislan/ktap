import React from 'react';
import { Card } from 'baseui/card';
import Tag from '../../components/tag';
import { Block } from 'baseui/block';
import { Button } from "baseui/button";
import { ParagraphMedium } from 'baseui/typography';
import { MOBILE_BREAKPOINT } from '../../constants';
import { Star } from '../../components/icons';
import RouterLink from '../../components/router-link';

const tips = ['查看更多', '我还要', '再看看', '再来', 'More, More', '再查，再探', '接着奏乐，接着舞'];

function AppListRecommend() {
    const limit = 10;
    const [dataList, setDataList] = React.useState([]);
    const [hasMore, setHasMore] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [skip, setSkip] = React.useState(0);

    React.useEffect(() => {
        const fetchApps = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/apps/recommended?limit=${limit}&skip=${skip}`);
                if (res.ok) {
                    const json = await res.json();
                    setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                    setHasMore(json.skip + json.limit < json.count);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchApps();
    }, [skip]);

    return (
        <Block display='flex' flexDirection='column' width='100%'>
            <Block display='flex' flexDirection='column'>
                {dataList.map(({ id, name, summary, score, media, tags }) => (
                    <Card key={id}
                        overrides={{
                            Root: {
                                style: ({ $theme }) => ({
                                    [MOBILE_BREAKPOINT]: { width: 'auto' },
                                    width: '100%',
                                    marginBottom: $theme.sizing.scale600,
                                    backgroundColor: $theme.colors.backgroundSecondary,
                                })
                            },
                            Contents: {
                                style: ({ $theme }) => ({
                                    marginTop: $theme.sizing.scale300,
                                })
                            },
                            HeaderImage: { style: () => ({ width: '100%', }) }
                        }}
                        headerImage={media.landscape.image}
                    >
                        <Block overrides={{
                            Block: {
                                style: ({ $theme }) => ({
                                    fontSize: $theme.sizing.scale700,
                                    lineHeight: $theme.sizing.scale850,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                })
                            }
                        }}>
                            <Block overrides={{
                                Block: {
                                    style: {
                                        fontSize: 'inherit',
                                        lineHeight: 'inherit'
                                    }
                                }
                            }}>
                                <RouterLink href={`/apps/${id}`} kind='underline'>{name}</RouterLink>
                            </Block>
                            <Block display='flex' justifyContent='center' alignItems='center'>
                                <Block marginRight='scale0' overrides={{
                                    Block: {
                                        style: {
                                            fontSize: 'inherit',
                                            lineHeight: 'inherit'
                                        }
                                    }
                                }}>
                                    {score}
                                </Block>
                                <Star width='24px' height='24px' />
                            </Block>
                        </Block>
                        <ParagraphMedium marginTop='scale200' marginBottom='scale200'>{summary}</ParagraphMedium>
                        <Block display='flex' gridGap='scale300' alignItems='center' flexWrap marginTop='scale400'>
                            {tags.map((tag, i) => (
                                <Tag key={i}>
                                    <RouterLink href={`/tags/${tag.name}`}>{tag.name}</RouterLink>
                                </Tag>
                            ))}
                        </Block>
                    </Card>
                ))}
            </Block>

            <Block marginTop='scale600' display='flex' justifyContent='center' alignItems='center'>
                <Button size='default' kind='tertiary' isLoading={isLoading} disabled={!hasMore} onClick={() => setSkip(prev => prev + limit)}>
                    {hasMore ? tips[Math.floor(Math.random() * tips.length) | 0] : '没有了'}
                </Button>
            </Block>
        </Block >
    );
}

export default AppListRecommend;
