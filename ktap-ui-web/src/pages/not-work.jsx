import { Block } from 'baseui/block';
import { DisplayMedium, ParagraphLarge } from 'baseui/typography';
import { Button } from 'baseui/button';
import { MOBILE_BREAKPOINT } from '../libs/utils';

function NotWork() {
    return (
        <Block display='flex' alignItems='center' flexDirection='column' maxWidth='664px' margin='48px auto' padding='scale600'>
            <DisplayMedium marginBottom='scale600'>5xx - 服务故障</DisplayMedium>
            <Block><img src='/public/img/5xx.svg' /></Block>
            <ParagraphLarge
                color='primary100'
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
                首先，对不起，正常情况下你应该看不到本页面的。
                然后，可能是你发现了什么漏洞，请联系我。
                最后，愿圣光忽悠着你。
            </ParagraphLarge>
            <Block marginTop='scale900'><Button size='default' kind='secondary' onClick={() => location.href = '/'}>去首页</Button></Block>
        </Block>
    );
}

export default NotWork;