import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { HeadingSmall, LabelLarge, LabelMedium, LabelSmall, ParagraphMedium } from 'baseui/typography';
import { useAuth } from '../../hooks/use-auth';
import AvatarSquare from '../../components/avatar-square';
import GenderLabel from '../../components/gender-label';

function UserDataItem({ name, value }) {
    return (
        <Block display='flex' flexDirection='column' alignItems='flex-start' padding='scale300' width='100%'
            overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        backgroundColor: 'rgba(51,51,51,.6)',
                        borderRadius: $theme.borders.radius300,
                    })
                }
            }}
        >
            <HeadingSmall marginTop='0' marginBottom='0' overrides={{
                Block: {
                    style: () => ({
                        fontWeight: '700',
                    })
                }
            }}>{value}</HeadingSmall>
            <LabelSmall color='primary200' marginBottom='scale100'>{name}</LabelSmall>
        </Block>
    );
}

function UserProfile({ theUser, theUserMeta }) {
    const navigate = useNavigate();
    let { user } = useAuth();
    const [isFollowed, setIsFollowed] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            if (user) {
                const res = await fetch(`/api/user/follows/user/${theUser.id}`);
                if (res.ok) {
                    const json = await res.json();
                    setIsFollowed(json.data.follow);
                }
            }
        })();
    }, [theUser, user]);

    const handleFollow = async () => {
        if (!user) navigate('/login');
        await fetch(`/api/user/follows/user/${theUser.id}`, { method: isFollowed ? 'DELETE' : 'POST', });
        setIsFollowed(prev => !prev);
    };

    return (
        <Block backgroundColor='backgroundSecondary' marginBottom='scale800' padding='scale600' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    borderRadius: $theme.borders.radius300,
                })
            }
        }}>

            <Block display='flex' justifyContent='flex-start'>
                <AvatarSquare name={theUser?.name} size='128px' src={theUser?.avatar} radius='8px' />
            </Block>
            <Block marginTop='scale600' display='flex' flexDirection='column'>
                <Block display='flex' alignItems='center' justifyContent='flex-start' marginBottom='scale300'>
                    <LabelLarge marginRight='scale100'>{theUser?.name}</LabelLarge>
                    <GenderLabel gender={theUser?.gender} />
                </Block>
                <LabelMedium>{theUser?.title}</LabelMedium>
                <ParagraphMedium>{theUser?.bio}</ParagraphMedium>
                <Block paddingTop='scale100' paddingBottom='scale100'>
                    <Button kind='secondary'
                        overrides={{
                            BaseButton: {
                                style: {
                                    width: '100%',
                                }
                            }
                        }}
                        onClick={() => user && user.id === theUser?.id ? navigate('/settings') : handleFollow()} >
                        {user && user.id === theUser?.id ? '编辑' : (isFollowed ? '取消关注' : '关注')}
                    </Button>
                </Block>
                <Block display='flex' justifyContent='space-between' gridGap='scale300' alignItems='center' marginTop='scale600' marginBottom='scale600'>
                    <UserDataItem name='关注数' value={theUserMeta?.follows?.count} />
                    <UserDataItem name='评测数' value={theUserMeta?.reviews} />
                    <UserDataItem name='回复数' value={theUserMeta?.comments} />
                </Block>
            </Block>
        </Block>
    );
}

export default UserProfile;