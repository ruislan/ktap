import React from 'react';
import { Block } from 'baseui/block';
import { DisplayMedium, ParagraphSmall } from 'baseui/typography';
import { Button } from 'baseui/button';
import { FormControl } from "baseui/form-control";
import { Input } from 'baseui/input';
import { Checkbox } from 'baseui/checkbox';
import { MOBILE_BREAKPOINT, Messages } from '../constants';
import Notification from '../components/notification';
import RouterLink from '../components/router-link';

function Register() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [notification, setNotification] = React.useState(null);
    const [register, setRegister] = React.useState({
        email: '',
        name: '',
        password: '',
        agree: false,
    });
    const handleSubmit = async () => {
        setNotification(null);
        setIsLoading(true);
        try {
            if (!register.agree) throw new Error(Messages.requireAgreePrivacy);
            const res = await fetch('/api/register', { method: 'POST', body: JSON.stringify(register), headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                window.location.href = '/login';
            } else {
                const data = await res.json();
                throw new Error(data.message);
            }
        } catch (e) {
            setNotification({ kind: 'negative', message: e.message || Messages.unknownError });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Block display='flex' minHeight='calc(100vh - 328px)' marginTop='scale800' overrides={{
            Block: {
                style: {
                    [MOBILE_BREAKPOINT]: {
                        flexDirection: 'column',
                    }
                }
            }
        }}>
            <Block maxWidth='384px' padding='scale1200' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            paddingTop: $theme.sizing.scale300,
                            overflow: 'hidden',
                            maxHeight: '196px',
                            display: 'none',
                        }
                    })
                }
            }}>
                <img width='100%' height='85%' src='/public/img/standing.svg' />
            </Block>
            <Block
                display='flex'
                flexDirection='column'
                padding='scale1200'
                width='384px'
                overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            [MOBILE_BREAKPOINT]: {
                                width: '100%',
                                padding: $theme.sizing.scale900,
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
                }}>注册</DisplayMedium>
                <Block>
                    <ParagraphSmall>免费注册KTap，探索成千上万的游戏，分享你的心情，发表你的见解和态度。</ParagraphSmall>
                    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                        {notification && <Notification kind={notification.kind} message={notification.message} />}
                        <FormControl label='电子邮箱'>
                            <Input size='compact' type='email' value={register.email} onChange={e => setRegister({ ...register, email: e.target.value })} required />
                        </FormControl>
                        <FormControl label='用户名'>
                            <Input size='compact' value={register.name} onChange={e => setRegister({ ...register, name: e.target.value })} required />
                        </FormControl>
                        <FormControl label='密码'>
                            <Input size='compact' value={register.password} type='password' onChange={e => setRegister({ ...register, password: e.target.value })} required />
                        </FormControl>
                        <FormControl>
                            <Checkbox
                                labelPlacement='right'
                                checked={register.agree}
                                onChange={e => setRegister({ ...register, agree: e.target.checked })}
                                overrides={{
                                    Checkmark: {
                                        style: ({ $theme }) => ({
                                            width: $theme.sizing.scale600,
                                            height: $theme.sizing.scale600,
                                        })
                                    },
                                    Label: {
                                        style: ({ $theme }) => ({
                                            fontSize: $theme.sizing.scale550,
                                            paddingLeft: $theme.sizing.scale100,
                                            lineHeight: $theme.sizing.scale700,
                                            color: $theme.colors.primary100,
                                        })
                                    }
                                }}
                            >
                                同意 <RouterLink href='/terms' target='_blank' kind='underline'>服务协议</RouterLink> 和 <RouterLink href='/privacy' target='_blank' kind='underline'>隐私政策</RouterLink>
                            </Checkbox>
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
                                注册
                            </Button>
                        </Block>
                    </form>
                    <Block>
                        <ParagraphSmall>已经有 KTap 账户？ <RouterLink href='/login' kind='underline'>登录</RouterLink></ParagraphSmall>
                    </Block>
                </Block>
            </Block>
        </Block >
    );
}

export default Register;