import React from 'react';
import { Block } from 'baseui/block';
import { Notification } from "baseui/notification";
import { DisplayMedium, ParagraphSmall } from 'baseui/typography';
import { Button } from 'baseui/button';
import { FormControl } from "baseui/form-control";
import { Input } from 'baseui/input';
import { MOBILE_BREAKPOINT } from '../constants';
import { useAuth } from '../hooks/use-auth';
import RouterLink from '../components/router-link';

function Login() {
    const [login, setLogin] = React.useState({ email: '', password: '', });
    const [error, setError] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const auth = useAuth();

    const handleSubmit = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await auth.login(login.email, login.password);
            window.location.href = '/';
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Block display='flex' minHeight='calc(100vh - 328px)' marginTop='scale800' overrides={{
            Block: {
                style: {
                    [MOBILE_BREAKPOINT]: {
                        display: 'grid',
                        gridAutoColumns: '1fr',
                    }
                }
            }
        }}>
            <Block display='flex' flexDirection='column' padding='scale1200' minWidth='384px'
                overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            [MOBILE_BREAKPOINT]: {
                                width: '100%',
                                paddingTop: $theme.sizing.scale400,
                                paddingLeft: $theme.sizing.scale900,
                                paddingRight: $theme.sizing.scale900,
                                gridArea: '2 / 1',
                            }
                        })
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
                }}>登录</DisplayMedium>
                <Block>
                    <Block><ParagraphSmall>还没有 KTap 账户？ <RouterLink href='/register' kind='underline'>创建</RouterLink></ParagraphSmall></Block>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
                        {error &&
                            <Block paddingBottom='scale100' paddingTop='scale100'>
                                <Notification kind='negative' closeable overrides={{
                                    Body: {
                                        style: {
                                            width: 'auto', marginLeft: 0, marginRight: 0,
                                        }
                                    }
                                }}>
                                    {error}
                                </Notification>
                            </Block>
                        }
                        <FormControl label='电子邮箱'>
                            <Input size='compact' type='email' value={login.email} required onChange={e => setLogin({ ...login, email: e.currentTarget.value })} />
                        </FormControl>
                        <FormControl label='密码'>
                            <Input size='compact' type='password' value={login.password} required onChange={e => setLogin({ ...login, password: e.currentTarget.value })} />
                        </FormControl>
                        <Block width='100%' paddingTop='scale800'>
                            <Button isLoading={isLoading} size='compact' kind='primary' type='submit'
                                overrides={{
                                    BaseButton: {
                                        style: {
                                            width: '100%',
                                        }
                                    }
                                }}
                            >
                                登录
                            </Button>
                        </Block>
                    </form>
                    <Block>
                        <RouterLink href='/password/forgot' kind='underline'><ParagraphSmall>忘记密码</ParagraphSmall></RouterLink>
                    </Block>
                </Block>
            </Block>
            <Block maxWidth='384px' padding='scale1200' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            paddingTop: $theme.sizing.scale300,
                            overflow: 'hidden',
                            maxHeight: '196px',
                        }
                    })
                }
            }}>
                <img width='100%' src='/public/img/sitting.svg' />
            </Block>
        </Block >
    );
}

export default Login;