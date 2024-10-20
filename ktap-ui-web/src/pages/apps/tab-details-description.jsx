import React from 'react';
import { LabelLarge } from 'baseui/typography';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import '../../assets/css/post.css';

function TabDetailsDescription({ app }) {
    const [isHide, setIsHide] = React.useState(true);
    const [expendable, setExpendable] = React.useState(true);
    const descriptionRef = React.useRef(null);

    React.useEffect(() => {
        setExpendable(descriptionRef.current?.clientHeight > 400);
    }, [descriptionRef.current?.clientHeight]);
    return (
        <Block paddingTop='scale600' paddingBottom='scale600'>
            <Block paddingTop='scale300' paddingBottom='scale300' font='font300'>
                <LabelLarge>详细介绍</LabelLarge>
            </Block>
            <Block overrides={{
                Block: {
                    style: {
                        overflow: 'hidden',
                        maxHeight: isHide ? '400px' : 'auto',
                    }
                }
            }}>
                <div ref={descriptionRef} className={'post'} dangerouslySetInnerHTML={{ __html: app.description }}></div>
            </Block>
            {
                expendable &&
                <Block width='100%' display='flex' flexDirection='column' position='relative' backgroundColor='rgb(28,28,28)' marginTop={isHide ? '0' : 'scale600'}>
                    <Button kind='secondary' size='compact' onClick={() => setIsHide(prev => !prev)}>{isHide ? '显示全部' : '隐藏部分'}</Button>
                    <Block overrides={{
                        Block: {
                            style: {
                                position: 'absolute',
                                background: isHide ? 'linear-gradient(rgba(28, 28, 28, 0), rgb(28, 28, 28))' : null,
                                top: '-100px',
                                height: isHide ? '100px' : 'auto',
                                width: '100%'
                            }
                        }
                    }} />
                </Block>
            }
        </Block>
    );
}
export default TabDetailsDescription;