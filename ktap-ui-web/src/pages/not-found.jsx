import React from 'react';
import { Block } from 'baseui/block';
import { DisplayMedium, ParagraphLarge } from 'baseui/typography';
import { Button } from 'baseui/button';
import { MOBILE_BREAKPOINT } from '../libs/utils';

function NotFound() {
    return (
        <Block display='flex' alignItems='center' flexDirection='column' maxWidth='664px' margin='48px auto' padding='scale600'>
            <DisplayMedium marginBottom='scale600'>404 - 你懂的</DisplayMedium>
            <Block><img src='/public/img/404.svg' /></Block>
            <ParagraphLarge color='primary100'
                marginBottom='scale600'
                paddingLeft='scale1200' paddingRight='scale1200'
                overrides={{
                    Block: {
                        style: () => ({
                            [MOBILE_BREAKPOINT]: {
                                paddingLeft: 0,
                                paddingRight: 0,
                            }
                        })
                    }
                }}>
                看起来你访问了一个我们未知的页面，或者你访问的页面已经被删除，或者你是不是自己输入了网址？
                我猜你可能想探索网站，为何不试试点上面菜单的”探索“呢？
            </ParagraphLarge>
            <Block marginTop='scale900'><Button size='default' kind='secondary' onClick={() => history.go(-1)}>返回前页</Button></Block>
        </Block>
    );
}

export default NotFound;