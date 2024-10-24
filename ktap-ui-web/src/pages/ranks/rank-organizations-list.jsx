import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from "baseui/block";
import { Hide as HideIcon } from 'baseui/icon';
import { LabelMedium, LabelLarge, LabelXSmall } from 'baseui/typography';

import { MOBILE_BREAKPOINT, PAGE_LIMIT_NORMAL } from '@ktap/libs/utils';
import Capsule from '@ktap/components/capsule';
import LoadMore from '@ktap/components/load-more';

function RankOrganizationsList({ apiUrl }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [css, theme] = useStyletron();
    const [skip, setSkip] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [dataList, setDataList] = React.useState([]);
    const [hasMore, setHasMore] = React.useState(false);
    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${apiUrl}?skip=${skip}&limit=${limit}`);
                if (res.ok) {
                    const json = await res.json();
                    setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                    setHasMore(json.skip + json.limit < json.count);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [apiUrl, skip, limit]);
    return (
        <Block display='flex' flexDirection='column' gridGap='scale300'>
            {dataList && dataList.map((org, index) => {
                return (
                    <Capsule key={index} href={`/organizations/${org.id}`}>
                        <LabelLarge width='scale950' alignSelf='center' marginRight='scale300' marginLeft='scale0' overrides={{
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
                            {
                                org.logo ?
                                    <img src={org.logo} className={css({ width: '100%', height: '100%', borderRadius: theme.sizing.scale100 })} /> :
                                    <div className={css({
                                        width: '100%', height: '100%', borderRadius: theme.sizing.scale100,
                                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                                        backgroundColor: 'rgba(41,41,41,.6)',
                                    })}>
                                        <HideIcon $size='scale800' />
                                    </div>
                            }
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
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='76px' onClick={() => setSkip(prev => prev + limit)} />
        </Block>
    );
}
export default RankOrganizationsList;