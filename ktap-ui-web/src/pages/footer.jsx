import { Block } from 'baseui/block';
import { LabelSmall } from 'baseui/typography';

import RouterLink from '@ktap/components/router-link';

export default function Footer() {
    return (
        <footer>
            <Block backgroundColor='backgroundSecondary' color='contentPrimary' marginTop='scale1400'
                paddingTop='scale1600' paddingBottom='scale1600' paddingLeft='0' paddingRight='0'
                display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                <Block marginBottom='scale800'>
                    <Block display='flex' alignItems='baseline' gridGap='scale300' font='font300' overrides={{
                        Block: {
                            style: () => ({
                                fontSize: '14px',
                            })
                        }
                    }}>
                        <RouterLink href='https://github.com/ruislan/ktap' kind='underline' role='a' target='_blank'>Github</RouterLink>
                        <RouterLink href='#' kind='underline' role='a' target='_blank'>博客</RouterLink>
                        <RouterLink href='/about' kind='underline' target='_blank'>关于我们</RouterLink>
                        <RouterLink href='/terms' kind='underline' target='_blank'>服务协议</RouterLink>
                        <RouterLink href='/privacy' kind='underline' target='_blank'>隐私声明</RouterLink>
                        <RouterLink href='/rules' kind='underline' target='_blank'>社区规则</RouterLink>
                    </Block>
                </Block>
                <LabelSmall>
                    Copyrights ©2023 . All rights reserved.
                </LabelSmall>
            </Block>
        </footer>
    );
}