import React from 'react';

import { LabelMedium, LabelSmall } from 'baseui/typography';
import { Block } from 'baseui/block';
import { Skeleton } from 'baseui/skeleton';

import { Numbers } from '@ktap/libs/utils';
import { Fire } from '@ktap/components/icons';
import SideBox from '@ktap/components/side-box';
import ListItem from '@ktap/components/list-item';

export default function SideHotSearch() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [dataList, setDataList] = React.useState([]);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/search/hot');
                if (res.ok) {
                    const json = await res.json();
                    setDataList(json.data);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    return (
        <SideBox title='热门搜索'>
            <Block display='flex' flexDirection='column' alignItems='center' paddingLeft='scale300' paddingBottom='scale600' paddingRight='scale300'>
                {isLoading && <Block width='100%' display='flex' flexDirection='column' marginTop='scale300' marginBottom='scale300' gridGap='scale300' justifyContent='center'>
                    <Skeleton animation height='40px' width='100%' />
                    <Skeleton animation height='40px' width='100%' />
                    <Skeleton animation height='40px' width='100%' />
                </Block>}
                {dataList.map(({ content, hitCount }, index) => {
                    return (
                        <ListItem key={index} href={`/search?q=${content}`} replace={true}>
                            <LabelMedium>{content}</LabelMedium>
                            <Block display='flex' alignItems='center'>
                                <Fire width='16px' height='16px' />
                                <LabelSmall marginLeft='scale100'>{Numbers.abbreviate(hitCount)}</LabelSmall>
                            </Block>
                        </ListItem>
                    );
                })}
            </Block>
        </SideBox>
    );
}