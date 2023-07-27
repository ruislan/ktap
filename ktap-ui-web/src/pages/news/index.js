import React from 'react';
import { useStyletron } from 'baseui';
import { Block } from "baseui/block";
import { Button } from "baseui/button";
import { LAYOUT_MAIN, MOBILE_BREAKPOINT, PAGE_LIMIT_NORMAL } from '../../constants';
import { Skeleton } from 'baseui/skeleton';
import NewsItem from './news-item';

function News() {
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
    }, [skip, limit]);

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
            {dataList && dataList.map((news, index) => <NewsItem key={index} news={news} />)}
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