import React from 'react';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';

import SideBox from '@ktap/components/side-box';

function SideAward({ app }) {
    const [isHide, setIsHide] = React.useState(true);
    const [expendable, setExpendable] = React.useState(false);
    const awardRef = React.useRef(null);

    const checkExpendable = React.useCallback(() => {
        setExpendable(awardRef.current?.clientHeight > 600);
    }, [])

    return (
        <SideBox title='获取奖项'>
            <Block overflow='hidden' maxHeight={isHide ? '600px' : 'fit-content'} padding='scale600'>
                <Block ref={awardRef}>
                    {app?.awards && app.awards.map((award, index) => (
                        award.url && award.url.length > 0 && award.url !== '#' ?
                            <a key={index} href={award.url}><img width='100%' src={award.image} onLoad={() => checkExpendable()} /></a> :
                            <img key={index} width='100%' src={award.image} onLoad={() => checkExpendable()} />
                    ))}
                </Block>
            </Block>
            {
                expendable &&
                <Block width='100%' display='flex' flexDirection='column' position='relative' backgroundColor='rgb(28,28,28)'>
                    <Button kind='secondary' size='compact' onClick={() => setIsHide(prev => !prev)}>{isHide ? '显示全部' : '隐藏部分'}</Button>
                    <Block overrides={{
                        Block: {
                            style: {
                                position: 'absolute',
                                background: isHide ? 'linear-gradient(rgba(28, 28, 28, 0), rgb(28, 28, 28))' : null,
                                top: '-100px',
                                height: '100px',
                                width: '100%'
                            }
                        }
                    }}></Block>
                </Block>
            }
        </SideBox>
    );
}

export default SideAward;