import React from 'react';

import { Block } from 'baseui/block';

import { PAGE_LIMIT_NORMAL } from '@ktap/libs/utils';
import LoadMore from '@ktap/components/load-more';
import Achievement from '@ktap/components/achievement';

export default function TabAchievements({ theUser }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [dataList, setDataList] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);

    React.useEffect(() => {
        if (!theUser) return;
        (async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/users/${theUser.id}/achievements?skip=${skip}&limit=${limit}`);
                if (res.ok) {
                    const json = await res.json();
                    setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                    setHasMore(json.skip + json.limit < json.count);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [theUser, skip, limit]);

    return (
        <Block display='flex' flexDirection='column' gridGap='scale600'>
            {dataList?.map((achievement, index) => (
                <Achievement key={index} achievement={achievement} />
            ))}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='104px' onClick={() => setSkip(prev => prev + limit)} />
        </Block>
    );
};