import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from "baseui/block";

import { LAYOUT_MAIN, MOBILE_BREAKPOINT, PAGE_LIMIT_NORMAL } from '@ktap/libs/utils';
import LoadMore from '@ktap/components/load-more';

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
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='212px' onClick={() => setSkip(prev => prev + limit)} />
        </Block >
    );
}

export default News;