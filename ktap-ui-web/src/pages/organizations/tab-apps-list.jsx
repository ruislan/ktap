import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from "baseui/block";
import { LabelMedium } from 'baseui/typography';

import { Icon, Star } from '@ktap/components/icons';
import { MOBILE_BREAKPOINT, PAGE_LIMIT_NORMAL } from '@ktap/libs/utils';
import Capsule from '@ktap/components/capsule';
import LoadMore from '@ktap/components/load-more';

function TabAppsList({ url }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [css, theme] = useStyletron();
    const [skip, setSkip] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [appList, setAppList] = React.useState([]);
    const [hasMore, setHasMore] = React.useState(false);
    React.useEffect(() => {
        (async () => {
            if (url) {
                setIsLoading(true);
                try {
                    const res = await fetch(`${url}?skip=${skip}&limit=${limit}`);
                    if (res.ok) {
                        const json = await res.json();
                        setAppList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                        setHasMore(json.skip + json.limit < json.count);
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        })();
    }, [url, skip, limit]);
    return (
        <Block display='flex' flexDirection='column' gridGap='scale600'>
            {appList && appList.map((app, index) => {
                return (
                    <Capsule key={index} href={`/apps/${app.id}`}>
                        <Block marginLeft='scale100' width='138px' height='68px'>
                            <img src={app.media.head.thumbnail} className={css({ width: '100%', height: '100%', borderRadius: theme.sizing.scale100 })} />
                        </Block>
                        <Block display='flex' alignSelf='center' flexDirection='column' paddingLeft='scale600' paddingRight='scale600'
                            paddingTop='scale100' flex={1} overflow='auto'
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
                            <LabelMedium marginBottom='scale100' overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis'>
                                {app.name}
                            </LabelMedium>
                            <Block display='flex' alignItems='center'>
                                <LabelMedium marginRight='scale0'>{app.score}</LabelMedium>
                                <Icon><Star /></Icon>
                            </Block>
                        </Block>
                    </Capsule>
                );
            })}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='68px' onClick={() => setSkip(prev => prev + limit)} />
        </Block>
    );
}
export default TabAppsList;