import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from "baseui/block";
import { Button } from 'baseui/button';
import { Spinner } from 'baseui/spinner';
import { LabelMedium, LabelLarge, LabelXSmall } from 'baseui/typography';
import { MOBILE_BREAKPOINT } from '../../constants';
import Capsule from '../../components/capsule';

function RankOrganizationsList({ url }) {
    const limit = 10;
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
    }, [url, skip]);
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
            {isLoading && <Block display='flex' justifyContent='center' marginTop='scale900' marginBottom='scale900'><Spinner $size='scale1600' $borderWidth='scale200' /></Block>}
            <Block marginTop='scale600' display='flex' justifyContent='center' alignItems='center'>
                <Button size='default' kind='tertiary' onClick={() => setSkip(prev => prev + limit)} isLoading={isLoading} disabled={!hasMore}>
                    {hasMore ? '查看更多' : '没有了'}
                </Button>
            </Block>
        </>
    );
}
export default RankOrganizationsList;