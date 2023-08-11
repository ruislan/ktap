import React from 'react';

import { Block } from 'baseui/block';
import { Notification } from 'baseui/notification';
import { DisplayMedium, ParagraphSmall } from 'baseui/typography';
import { Button } from 'baseui/button';
import { FormControl } from "baseui/form-control";
import { Input } from 'baseui/input';

import { LAYOUT_LEFT, MOBILE_BREAKPOINT } from '@ktap/libs/utils';
import RouterLink from '@ktap/components/router-link';

function PasswordForgot() {
    const [email, setEmail] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState(null);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const handleSendPassword = async () => {
        setIsSuccess(false);
        setErrorMessage(null);
        setIsLoading(true);
        try {
            const res = await fetch('/api/password/forgot', { method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                setIsSuccess(true);
            } else if (res.status === 400) {
                setErrorMessage('您输入的邮箱地址不正确或者您还不是网站用户');
            } else if (res.status === 500) {
                setErrorMessage('邮件发送失败，请稍后再尝试');
            }
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Block display='flex' minHeight='calc(100vh - 328px)' marginTop='scale800'>
            <Block display='flex' flexDirection='column' padding='scale1200' minWidth='384px' width={LAYOUT_LEFT}
                overrides={{
                    Block: {
                        style: {
                            [MOBILE_BREAKPOINT]: {
                                width: '100%'
                            }
                        }
                    }
                }}
            >
                <DisplayMedium overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            [MOBILE_BREAKPOINT]: {
                                fontSize: $theme.sizing.scale1000,
                                lineHeight: $theme.sizing.scale1200,
                            }
                        })
                    }
                }}>找回密码</DisplayMedium>
                <Block>
                    <Block marginBottom='scale900'><ParagraphSmall>输入您的注册邮箱地址，我们将发送一串随机验证码给您，用来重置密码。</ParagraphSmall></Block>
                    {errorMessage && <Notification kind='negative' closeable overrides={{
                        Body: { style: { width: 'auto', marginLeft: 0, marginRight: 0, } },
                    }}>{errorMessage}</Notification>}
                    {isSuccess && <Notification kind='positive' closeable overrides={{
                        Body: { style: { width: 'auto', marginLeft: 0, marginRight: 0, } },
                    }}>
                        我们向您的邮箱{email}发送了一封包含有下一步说明的电子邮件，请前往邮箱查看。
                    </Notification>}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSendPassword();
                    }}>
                        <FormControl label='电子邮箱'>
                            <Input readOnly={isSuccess} size='compact' value={email} onChange={e => setEmail(e.currentTarget.value)} type='email' required />
                        </FormControl>
                        <Block width='100%' marginTop='scale300'>
                            <Button size='compact' kind='primary' isLoading={isLoading} disabled={isSuccess} type='submit'>发送密码重置</Button>
                        </Block>
                    </form>
                    <Block>
                        {isSuccess ?
                            <ParagraphSmall>已经完成？请前往 <RouterLink href='/login' kind='underline'>登录</RouterLink></ParagraphSmall>
                            :
                            <ParagraphSmall>还没有 KTap 账户？ <RouterLink href='/register' kind='underline'>创建</RouterLink></ParagraphSmall>
                        }

                    </Block>
                </Block>
            </Block>
        </Block >
    );
}

export default PasswordForgot;