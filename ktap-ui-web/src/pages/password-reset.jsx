import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Block } from 'baseui/block';
import { DisplayMedium, ParagraphSmall } from 'baseui/typography';
import { Button } from 'baseui/button';
import { FormControl } from "baseui/form-control";
import { Input } from 'baseui/input';
import { Notification } from 'baseui/notification';

import { LAYOUT_LEFT, MOBILE_BREAKPOINT, Messages } from '@ktap/libs/utils';
import RouterLink from '@ktap/components/router-link';

function PasswordReset() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState(null);
    const [isVerified, setIsVerified] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const handleResetPassword = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setIsSuccess(false);
        try {
            const res = await fetch('/api/password/reset', { method: 'POST', body: JSON.stringify({ password, code: searchParams.get('code') }), headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                setIsSuccess(true);
            } else if (res.status === 400) {
                setErrorMessage('重置密码错误，重置地址过期或者密码格式不对。');
            }
        } finally {
            setIsLoading(false);
        }
    };
    React.useEffect(() => {
        const verifyCode = async () => {
            const code = searchParams.get('code');
            if (code) {
                setIsLoading(true);
                setErrorMessage(null);
                try {
                    const res = await fetch('/api/password/code', { method: 'POST', body: JSON.stringify({ code }), headers: { 'Content-Type': 'application/json' } });
                    if (res.ok) {
                        setIsVerified(true);
                    } else if (res.status === 400) {
                        setErrorMessage('您的重置地址已经过期，请您重新重置密码');
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        };
        verifyCode();
    }, [searchParams]);
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
                }}>重置密码</DisplayMedium>
                <Block>
                    <Block marginBottom='scale900'><ParagraphSmall>请输入您的新密码，至少6位以上。</ParagraphSmall></Block>
                    {errorMessage && <Notification kind='negative' closeable overrides={{
                        Body: { style: { width: 'auto', marginLeft: 0, marginRight: 0, } },
                    }}>{errorMessage}</Notification>}
                    {isSuccess && <Notification kind='positive' closeable overrides={{
                        Body: { style: { width: 'auto', marginLeft: 0, marginRight: 0, } },
                    }}>{Messages.reset}</Notification>}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleResetPassword();
                    }}>
                        <FormControl label='新密码'>
                            <Input readOnly={!isVerified || isSuccess} name='password' size='compact' value={password} onChange={e => setPassword(e.currentTarget.value)} type='password' />
                        </FormControl>
                        <Block display='flex' width='100%' marginTop='scale300'>
                            <Button size='compact' kind='primary' type='submit'
                                disabled={!isVerified || isSuccess}
                                isLoading={isLoading}>{isSuccess ? '已完成重置' : '重置'}</Button>
                            {isSuccess && <ParagraphSmall marginLeft='scale300'>请前往 <RouterLink href='/login' kind='underline'>登录</RouterLink></ParagraphSmall>}
                        </Block>
                    </form>
                </Block>
            </Block>
        </Block >
    );
}

export default PasswordReset;