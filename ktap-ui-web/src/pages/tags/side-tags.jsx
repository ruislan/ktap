import React from 'react';

import { Block } from 'baseui/block';
import { Skeleton } from 'baseui/skeleton';
import { LabelMedium, MonoLabelMedium } from 'baseui/typography';
import { Button } from 'baseui/button';

import SideBox from '@ktap/components/side-box';
import ListItem from '@ktap/components/list-item';

function SideTags({ title, apiUrl }) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [dataList, setDataList] = React.useState([]);
    const [isHide, setIsHide] = React.useState(true);
    const [expendable, setExpendable] = React.useState(false);
    const expendRef = React.useRef(null);
    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(apiUrl);
                if (res.ok) {
                    const json = await res.json();
                    setDataList(json.data);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [apiUrl]);

    React.useEffect(() => {
        setExpendable(expendRef.current.clientHeight > 300);
    }, [isLoading]);

    return (
        <SideBox title={title}>
            {isLoading && <Block display='flex' flexDirection='column' paddingLeft='scale300' paddingRight='scale300' marginTop='scale300' marginBottom='scale300' gridGap='scale300' justifyContent='center'>
                <Skeleton animation height='40px' width='100%' />
                <Skeleton animation height='40px' width='100%' />
                <Skeleton animation height='40px' width='100%' />
            </Block>}
            <Block overflow='hidden' maxHeight={isHide ? '300px' : 'auto'} paddingLeft='scale300' paddingBottom='scale600' paddingRight='scale300'>
                <Block ref={expendRef}>
                    {dataList && dataList.map(({ name }, index) => {
                        return (
                            <ListItem key={index} href={`/tags/${name}`}>
                                <Block display='flex' alignItems='center'>
                                    <MonoLabelMedium marginRight='scale500'>{index + 1}</MonoLabelMedium>
                                    <LabelMedium>{name}</LabelMedium>
                                </Block>
                            </ListItem>
                        );
                    })}
                </Block>
            </Block>
            {
                expendable && isHide &&
                <Block width='100%' display='flex' flexDirection='column' position='relative' backgroundColor='rgb(28,28,28)'>
                    <Button kind='secondary' size='compact' onClick={() => setIsHide(prev => !prev)}>显示全部</Button>
                    <Block overrides={{
                        Block: {
                            style: {
                                position: 'absolute',
                                background: isHide ? 'linear-gradient(rgba(28, 28, 28, 0), rgb(28, 28, 28))' : null,
                                top: '-25px',
                                height: '25px',
                                width: '100%'
                            }
                        }
                    }}></Block>
                </Block>
            }
        </SideBox>
    );
}

export default SideTags;