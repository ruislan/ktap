import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from "baseui/block";
import { Button } from 'baseui/button';
import { LabelMedium, LabelLarge, LabelXSmall } from 'baseui/typography';
import { MOBILE_BREAKPOINT, PAGE_LIMIT_NORMAL } from '../../constants';
import Capsule from '../../components/capsule';
import { Skeleton } from 'baseui/skeleton';

function RankOrganizationsList({ url }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [css, theme] = useStyletron();
    const [skip, setSkip] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [dataList, setDataList] = React.useState([]);
    const [hasMore, setHasMore] = React.useState(false);
    React.useEffect(() => {
        (async () => {
            if (url) {
                setIsLoading(true);
                try {
                    const res = await fetch(`${url}?skip=${skip}&limit=${limit}`);
                    if (res.ok) {
                        const json = await res.json();
                        setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                        setHasMore(json.skip + json.limit < json.count);
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        })();
    }, [url, skip, limit]);
    return (
        <>
            {dataList && dataList.map((org, index) => {
                return (
                    <Capsule key={index} href={`/organizations/${org.id}`}>
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
                        <Block width='72px' height='72px'>
                            <img src={org.logo} className={css({ width: '100%', height: '100%', borderRadius: theme.sizing.scale100 })} />
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
                                {org.name}
                            </LabelMedium>
                            <Block display='flex' alignItems='center'>
                                <LabelXSmall marginRight='scale300' color='primary300'>开发 {org.meta.developed}</LabelXSmall>
                                <LabelXSmall marginRight='scale0' color='primary300'>发行 {org.meta.published}</LabelXSmall>
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
export default RankOrganizationsList;