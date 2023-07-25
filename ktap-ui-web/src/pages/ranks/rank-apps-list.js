import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from "baseui/block";
import { Button } from 'baseui/button';
import { LabelMedium, LabelLarge } from 'baseui/typography';
import { Star } from '../../components/icons';
import { MOBILE_BREAKPOINT } from '../../constants';
import Capsule from '../../components/capsule';
import { Skeleton } from 'baseui/skeleton';

function RankAppsList({ url }) {
    const limit = 20;
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
    }, [url, skip]);
    return (
        <>
            {appList && appList.map((app, index) => {
                return (
                    <Capsule key={index} href={`/apps/${app.id}`}>
                        <LabelLarge width='32px' alignSelf='center' marginRight='scale300' marginLeft='scale0' overrides={{
                            Block: {
                                style: {
                                    textAlign: 'center',
                                    fontWeight: 800,
                                    [MOBILE_BREAKPOINT]: {
                                        marginRight: theme.sizing.scale400,
                                    },
                                }
                            }
                        }}>{index + 1}</LabelLarge>
                        <Block width='138px' height='68px'>
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
                                <Star width='20px' height='20px' />
                            </Block>
                        </Block>
                    </Capsule>
                );
            })}
            {isLoading && <Block display='flex' flexDirection='column' gridGap='scale300' justifyContent='center'>
                <Skeleton animation height='76px' width='100%' />
                <Skeleton animation height='76px' width='100%' />
                <Skeleton animation height='76px' width='100%' />
            </Block>}
            {hasMore && !isLoading &&
                <Block marginTop='scale600' display='flex' justifyContent='center' alignItems='center'>
                    <Button size='default' kind='tertiary' onClick={() => setSkip(prev => prev + limit)}>
                        查看更多
                    </Button>
                </Block>
            }
        </>
    );
}
export default RankAppsList;