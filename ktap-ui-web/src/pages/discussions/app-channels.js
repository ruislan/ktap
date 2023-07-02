import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from 'baseui/skeleton';
import { Input } from 'baseui/input';
import { Button } from 'baseui/button';
import { Check, Search } from 'baseui/icon';
import { HeadingMedium, HeadingXSmall, LabelMedium, LabelSmall, LabelXSmall } from 'baseui/typography';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useAuth } from '../../hooks/use-auth';
import { ChatAlt2, Gift2, Message4, Pin, Reply } from '../../components/icons';
import { LAYOUT_MAIN, MOBILE_BREAKPOINT } from '../../constants';
import RouterLink from '../../components/router-link';
import SplitBall from '../../components/split-ball';
import Editor from './editor';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

function AppBanner({ appId }) {
    const [css, theme] = useStyletron();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [isFollowed, setIsFollowed] = React.useState(false);

    const handleFollow = async () => {
        if (!user) { navigate('/login'); return; }
        await fetch(`/api/user/follows/apps/${appId}`, { method: isFollowed ? 'DELETE' : 'POST', });
        setIsFollowed(prev => !prev);
    };

    React.useEffect(() => {
        const fetchFollow = async () => {
            if (user) {
                try {
                    const res = await fetch(`/api/user/follows/apps/${appId}`);
                    if (res.ok) {
                        const json = await res.json();
                        setIsFollowed(json?.data?.follow);
                    }
                } catch (e) {
                    setIsFollowed(false);
                }
            }
        }
        fetchFollow();
    }, [user, appId]);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/apps/${appId}/basic`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json.data);
                } else {
                    if (res.status === 404) navigate('/not-found', { replace: true });
                    if (res.status >= 500) navigate('/panic');
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [appId, navigate]);

    return (
        <>{
            isLoading ?
                <Skeleton width='100%' height='152px' animation /> :
                <Block width='100vw' justifyContent='center' display='flex' position='relative' backgroundColor='backgroundSecondary' overflow='hidden'>
                    <Block width='100%' height='100%'
                        overrides={{
                            Block: {
                                style: {
                                    background: `url(${data.media.head.image}) center/cover no-repeat `,
                                    filter: 'blur(60px) brightness(40%)',
                                    position: 'absolute',
                                    opacity: .6,
                                    zIndex: 1,
                                }
                            }
                        }}
                    />
                    <Block width={LAYOUT_MAIN} height='100%' display='flex' overrides={{
                        Block: {
                            style: {
                                zIndex: 2,
                                [MOBILE_BREAKPOINT]: {
                                    flexDirection: 'column',
                                    width: '100%',
                                },
                            }
                        }
                    }}>
                        <Block width='290px' height='136px' marginTop='scale300' marginBottom='scale300' marginRight='scale300' marginLeft='0'
                            overrides={{
                                Block: {
                                    style: {
                                        [MOBILE_BREAKPOINT]: {
                                            display: 'none',
                                        }
                                    }
                                }
                            }}
                        >
                            <img width='100%' height='100%' className={css({
                                borderRadius: theme.borders.radius300,
                            })} src={data.media.head.image} />
                        </Block>
                        <Block display='flex' flexDirection='column' margin='scale300' gridGap='scale100' justifyContent='space-between'>
                            <Block>
                                <HeadingMedium marginTop='0' marginBottom='0' >{data.name}</HeadingMedium>
                                <HeadingXSmall marginTop='0' marginBottom='0' color='primary100' overrides={{
                                    Block: {
                                        style: {
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            lineHeight: '25px',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                            textShadow: '1px 1px 0px rgb(0 0 0 / 50%)',
                                            [MOBILE_BREAKPOINT]: {
                                                marginBottom: theme.sizing.scale600,
                                            }
                                        }
                                    }
                                }}>讨论中心</HeadingXSmall>
                            </Block>
                            <Block>
                                <Button kind='secondary' size='compact' onClick={() => handleFollow()} startEnhancer={isFollowed ? <Check size={16} /> : null}>
                                    {isFollowed ? '已关注' : '关注'}
                                </Button>
                            </Block>
                        </Block>
                    </Block>
                </Block>
        }
        </>
    );
}

function Channels({ appId }) {
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(true);
    const [dataList, setDataList] = React.useState([]);
    const [channelId, setChannelId] = React.useState(0);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/discussions/apps/${appId}/channels`);
                if (res.ok) {
                    const json = await res.json();
                    setDataList([{ id: 0, name: '全部讨论', description: '最近发布或有回复的讨论' }, ...json.data]);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [appId]);


    return (
        <Block display='flex' flexDirection='column' gridGap='scale300' paddingTop='scale600' paddingBottom='scale600'>
            {isLoading ?
                <Skeleton height='64px' width='100%' /> :
                <Block paddingBottom='scale600' overflow='scrollX' display='flex' alignItems='center' gridGap='scale300'>
                    {dataList && dataList.map((channel, index) => {
                        return (
                            <div key={index} className={css({
                                display: 'flex', alignItems: 'center', gap: theme.sizing.scale300, overflow: 'hidden',
                                cursor: 'pointer', position: 'relative', padding: theme.sizing.scale300, minWidth: '240px',
                                backgroundColor: channel.id === channelId ? theme.colors.backgroundTertiary : theme.colors.backgroundSecondary,
                                borderRadius: theme.borders.radius300, textDecoration: 'none',
                                boxShadow: channel.id === channelId ? theme.lighting.shadow700 : 'unset',
                                ':hover': {
                                    backgroundColor: theme.colors.backgroundTertiary,
                                    boxShadow: theme.lighting.shadow700,
                                },
                            })} onClick={() => setChannelId(channel.id)}>
                                {channel.icon
                                    ? <img src={channel.icon} className={css({ objectFit: 'cover', borderRadius: theme.borders.radius300, width: theme.sizing.scale1200, height: theme.sizing.scale1200 })} alt={channel.name} />
                                    : <div className={css({
                                        borderRadius: theme.borders.radius300, width: theme.sizing.scale1200, height: theme.sizing.scale1200,
                                    })} title={channel.name}>
                                        <ChatAlt2 />
                                    </div>
                                }
                                <Block display='flex' flexDirection='column' gridGap='scale100' width='calc(100% - 56px)'>
                                    <LabelSmall color={channel.id === channelId ? '' : 'primary100'}>{channel.name}</LabelSmall>
                                    <LabelXSmall color={channel.id === channelId ? 'primary100' : 'primary300'} width='100%' whiteSpace='nowrap' overflow='hidden' textOverflow='ellipsis'>{channel.description}</LabelXSmall>
                                </Block>
                            </div>
                        );
                    })}
                </Block>
            }
            <ChannelDiscussions appId={appId} channelId={channelId} />
        </Block >
    );
}

function ChannelDiscussions({ appId, channelId, }) {
    const limit = 1;
    const [css, theme] = useStyletron();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const [discussions, setDiscussions] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const [isOpenEditorModal, setIsOpenEditorModal] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                setDiscussions([
                    { id: 1, subject: '训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记', content: '训练笔记内定', createdAt: '2022-06-20', isTop: true, ip: '101.101.101.101', meta: { comments: 372, gifts: 32, }, user: { id: 1, avatar: 'https://avatars.dicebear.com/api/adventurer-neutral/892.svg?width=285', name: '爱吃草鱼的小明明呀' }, last: { user: { id: 2, name: '哎哟喂' }, } },
                    { id: 2, subject: '训练笔记', content: '训练笔记内定', createdAt: '2023-06-20', isTop: false, ip: '101.101.101.101', meta: { comments: 30, gifts: 0 }, user: { id: 2, avatar: 'https://avatars.dicebear.com/api/adventurer-neutral/1231231.svg?width=285', name: 'admin' } },
                ]);
                setHasMore(true);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [appId, channelId, skip]);

    return (
        <Block display='flex' flexDirection='column' width='100%'>
            <Block display='flex' alignItems='center' justifyContent='space-between' paddingTop='scale300' paddingBottom='scale600'>
                {user ? <Button size='compact' kind='secondary' onClick={() => setIsOpenEditorModal(true)}>发起新话题</Button> : <Button size='compact' kind='secondary' onClick={e => {
                    e.preventDefault();
                    navigate('/login');
                }}>登录</Button>}
                <Block display='flex' alignItems='center' gridGap='scale300'>
                    <Input size='compact' placeholder='搜索' />
                    <Button size='compact' kind='secondary'><Search /></Button>
                </Block>
                <Modal onClose={() => setIsOpenEditorModal(false)}
                    closeable={false}
                    isOpen={isOpenEditorModal}
                    animate
                    autoFocus
                    role={ROLE.alertdialog}
                >
                    <ModalHeader>发起新话题</ModalHeader>
                    <ModalBody>
                        <Editor />
                    </ModalBody>
                    <ModalFooter>
                        <ModalButton kind='tertiary' onClick={() => setIsOpenEditorModal(false)}>关闭</ModalButton>
                        <ModalButton onClick={() => { }} isLoading={isLoading}>发送</ModalButton>
                    </ModalFooter>
                </Modal>
            </Block>
            {discussions?.length === 0 ?
                <LabelSmall marginTop='scale600' alignSelf='center' color='primary500'>无内容</LabelSmall> :
                discussions.map((discussion, index) => {
                    return (
                        <RouterLink key={index} href={`/discussions/apps/${appId}/view/${discussion.id}`}>
                            <Block display='flex' gridGap='scale300' width='100%' paddingTop='scale400' paddingBottom='scale400' overrides={{
                                Block: {
                                    style: {
                                        borderBottomColor: theme.borders.border300.borderColor,
                                        borderBottomWidth: theme.borders.border300.borderWidth,
                                        borderBottomStyle: theme.borders.border300.borderStyle,
                                    }
                                }
                            }}>
                                <img className={css({ borderRadius: theme.borders.radius300, marginTop: theme.sizing.scale0 })} src={discussion?.user?.avatar} width='36px' height='36px' />
                                <Block display='flex' flexDirection='column' flex='1'>
                                    <LabelMedium marginBottom='scale200'>{discussion?.subject}</LabelMedium>
                                    <Block display='flex' alignItems='center' color='primary300' flexWrap>
                                        {discussion.isTop &&
                                            <>
                                                <Pin width='16px' height='16px' />
                                                <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                            </>
                                        }
                                        <LabelSmall whiteSpace='nowrap' color='inherit' display='flex' alignItems='center' gridGap='scale0'>
                                            {discussion?.last?.user?.name && <Reply width='16px' height='16px' />}
                                            @{discussion?.last?.user ? discussion?.last?.user.name : discussion?.user?.name}
                                        </LabelSmall>
                                        <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                        {discussion?.meta?.comments > 0 &&
                                            <>
                                                <Block display='flex' alignItems='center' gridGap='scale0' color='inherit'>
                                                    <Message4 width='16px' height='16px' />
                                                    <LabelSmall color='inherit'>{discussion?.meta?.comments || 0}</LabelSmall>
                                                </Block>
                                                <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                            </>
                                        }
                                        {discussion?.meta?.gifts > 0 &&
                                            <>
                                                <Block display='flex' alignItems='center' gridGap='scale0' color='inherit'>
                                                    <Gift2 width='16px' height='16px' />
                                                    <LabelSmall color='inherit'>{discussion?.meta?.gifts || 0}</LabelSmall>
                                                </Block>
                                                <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                            </>
                                        }
                                        <LabelSmall whiteSpace='nowrap' color='inherit'>{dayjs(discussion?.createdAt).fromNow()}</LabelSmall>
                                    </Block>
                                </Block>
                            </Block>
                        </RouterLink>
                    );
                })
            }
            {hasMore &&
                <Block marginTop='scale800' display='flex' justifyContent='center'>
                    <Button size='default' kind='tertiary' isLoading={isLoading} onClick={() => setSkip(prev => prev + limit)}>
                        查看更多
                    </Button>
                </Block>
            }
        </Block>
    );
}

function AppChannels() {
    const { appId } = useParams();

    return (
        <Block display='flex' flexDirection='column' alignItems='center'>
            <AppBanner appId={appId} />
            <Block display='flex' flexDirection='column' width={LAYOUT_MAIN} marginTop='scale600' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            width: '100vw',
                            paddingLeft: $theme.sizing.scale300, paddingRight: $theme.sizing.scale300,
                        }
                    })
                }
            }}>
                <Channels appId={appId} />
            </Block>
        </Block>
    );
}

export default AppChannels;