import React from 'react';

import { LabelMedium, LabelSmall } from 'baseui/typography';
import { Block } from 'baseui/block';
import { Skeleton } from 'baseui/skeleton';
import { Fire } from '../../components/icons';
import SideBox from '../../components/side-box';
import ListItem from '../../components/list-item';

function SideHotKeywords() {
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
                {dataList.map(({ keyword, count }, index) => {
                    return (
                        <ListItem key={index} href={`/search?q=${keyword}`} replace={true}>
                            <LabelMedium>{keyword}</LabelMedium>
                            <Block display='flex' alignItems='center'>
                                <Fire width='16px' height='16px' />
                                <LabelSmall marginLeft='scale100'>{count}</LabelSmall>
                            </Block>
                        </ListItem>
                    );
                })}
            </Block>
        </SideBox>
    );
}

export default SideHotKeywords;