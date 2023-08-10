import React from 'react';
import { ListItem } from 'baseui/list';
import { Block } from 'baseui/block';
import { LabelLarge, LabelMedium, LabelSmall } from 'baseui/typography';
import { ChevronRight } from 'baseui/icon';
import { Skeleton } from 'baseui/skeleton';
import RouterLink from '../../components/router-link';

function TabNews({ app }) {
    const appId = app?.id || 0;
    const [isLoading, setIsLoading] = React.useState(false);
    const [newsList, setNewsList] = React.useState([]);
    React.useEffect(() => {
        (async () => {
            if (appId > 0) {
                setIsLoading(true);
                try {
                    const res = await fetch(`/api/apps/${appId}/news?limit=2`);
                    if (res.ok) {
                        const json = await res.json();
                        setNewsList(json.data || []);
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        })();
    }, [appId]);
    return (
        <Block paddingTop='scale600' paddingBottom='scale600'>
            <Block display='flex' alignItems='center' justifyContent='space-between' paddingTop='scale300' paddingBottom='scale300'>
                <LabelLarge>最新新闻</LabelLarge>
                <RouterLink href={`/news/apps/${appId}`}><LabelSmall>查看全部</LabelSmall></RouterLink>
            </Block>
            {isLoading ?
                <Skeleton width="100%" height="60px" animation /> :
                (newsList.length === 0 ?
                    <LabelMedium color='primary500'>无新闻</LabelMedium> :
                    newsList.map(({ id, title }, index) => {
                        return (
                            <RouterLink key={index} href={`/news/${id}`} >
                                <ListItem
                                    overrides={{
                                        Content: {
                                            style: {
                                                minHeight: '44px', paddingRight: '0px', marginLeft: '0px',
                                                width: '300px',borderBottomColor: 'rgba(255, 255, 255, 0.12)',
                                            }
                                        },
                                    }}
                                    endEnhancer={() => <ChevronRight />}
                                >
                                    <LabelMedium textOverflow='ellipsis' whiteSpace='nowrap' overflow='hidden' paddingRight='scale300'>{title}</LabelMedium>
                                </ListItem>
                            </RouterLink>
                        );
                    })
                )
            }
        </Block >
    );
}
export default TabNews;