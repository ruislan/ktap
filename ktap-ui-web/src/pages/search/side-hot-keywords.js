import React from 'react';

import { LabelMedium, LabelSmall } from 'baseui/typography';
import { Block } from 'baseui/block';
import { Fire } from '../../components/icons';
import { Spinner } from 'baseui/spinner';
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
                {
                    isLoading &&
                    (<Block display='flex' justifyContent='center' marginTop='scale600'>
                        <Spinner $size='scale1600' $borderWidth='scale200' />
                    </Block>)
                }
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