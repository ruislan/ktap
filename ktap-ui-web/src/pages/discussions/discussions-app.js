import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from 'baseui/skeleton';
import { Input } from 'baseui/input';
import { Button } from 'baseui/button';
import { Check, Search } from 'baseui/icon';
import { FormControl } from 'baseui/form-control';
import { HeadingMedium, HeadingXSmall, LabelMedium, LabelSmall, LabelXSmall } from 'baseui/typography';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useAuth } from '../../hooks/use-auth';
import { ChatAlt2, Gift2, Lock, Message4, Pin, Reply, Settings } from '../../components/icons';
import { LAYOUT_MAIN, MOBILE_BREAKPOINT, Messages, PAGE_LIMIT_NORMAL } from '../../constants';
import RouterLink from '../../components/router-link';
import SplitBall from '../../components/split-ball';
import Notification from '../../components/notification';
import Editor from '../../components/editor';
import LoadMore from '../../components/load-more';

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
                    throw { status: res.status };
                }
            } catch (error) {
                if (error?.status === 404) navigate('/discussions', { replace: true });
                else navigate('/not-work');
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
                                <HeadingMedium marginTop='0' marginBottom='0'>{data.name}</HeadingMedium>
                                <HeadingXSmall marginTop='0' marginBottom='0' color='primary100' overrides={{
                                    Block: {
                                        style: {
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            lineHeight: '25px',
                                            whiteSpace: 'normal',
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

function Channels({ appId, channelId = 0 }) {
    const [css, theme] = useStyletron();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = React.useState(true);
    const [dataList, setDataList] = React.useState([]);
    const [currentChannel, setCurrentChannel] = React.useState(null);
    const scrollRef = React.useRef(null);

    const [canSettingChannel, setCanSettingChannel] = React.useState(false);
    const [isOpenChannelSettingModal, setIsOpenChannelSettingModal] = React.useState(false);
    const [settingForm, setSettingForm] = React.useState(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitErrorMessage, setSubmitErrorMessage] = React.useState(null);

    const handleChannelSettingSubmit = async () => {
        setIsSubmitting(true);
        setSubmitErrorMessage(null);
        try {
            const res = await fetch(`/api/discussions/apps/${appId}/channels/${currentChannel.id}`, {
                method: 'PUT',
                body: JSON.stringify(settingForm),
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                setCurrentChannel({ ...currentChannel, ...settingForm });
                setDataList(prev => {
                    const index = prev.findIndex(channel => channel.id == currentChannel.id);
                    prev[index] = { ...prev[index], ...settingForm };
                    return [...prev];
                });
                setIsOpenChannelSettingModal(false);
            } else {
                if (res.status === 400) {
                    const json = await res.json();
                    setSubmitErrorMessage(json.message);
                } else if (res.status === 401) {
                    navigate('/login');
                } else {
                    setSubmitErrorMessage(Messages.unknownError);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/discussions/apps/${appId}/channels`);
                if (res.ok) {
                    const json = await res.json();
                    const allDiscussionCount = json?.data?.reduce((count, channel) => count + channel.meta.discussions, 0);
                    setDataList([{ id: 0, name: '全部讨论', description: '最近发布或有回复的讨论', meta: { discussions: allDiscussionCount } }, ...json.data]);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [appId]);

    React.useEffect(() => {
        if (dataList.length > 0) {
            setCurrentChannel(dataList.find(channel => channel.id == channelId));
        }
    }, [dataList, channelId]);

    React.useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }, [dataList, channelId]); // dataList 存在了，就可以滑动了

    React.useEffect(() => {
        const isAdmin = user?.isAdmin;
        const isModerator = currentChannel?.moderators?.some(moderator => moderator.id == user.id);
        setCanSettingChannel(isAdmin || isModerator);
    }, [currentChannel, user]);

    return (
        <Block display='flex' flexDirection='column' gridGap='scale600' paddingTop='scale600' paddingBottom='scale600'>
            {isLoading ?
                <Skeleton height='64px' width='100%' /> :
                <Block paddingBottom='scale600' overflow='scrollX' display='flex' alignItems='center' gridGap='scale300' height='80px'>
                    {dataList && dataList.map((channel, index) => {
                        return (
                            <Link key={index} ref={channel.id == channelId ? scrollRef : null} className={css({
                                display: 'flex', alignItems: 'center', gap: theme.sizing.scale300, overflow: 'hidden',
                                cursor: 'pointer', position: 'relative', padding: theme.sizing.scale300, minWidth: '240px', maxWidth: '240px', width: '240px',
                                backgroundColor: channel.id == channelId ? theme.colors.backgroundTertiary : theme.colors.backgroundSecondary,
                                borderRadius: theme.borders.radius300, textDecoration: 'none', color: 'inherit',
                                boxShadow: channel.id == channelId ? theme.lighting.shadow700 : 'unset',
                                ':hover': {
                                    backgroundColor: theme.colors.backgroundTertiary,
                                    boxShadow: theme.lighting.shadow700,
                                },
                            })} to={channel.id > 0 ? `/discussions/apps/${appId}/channels/${channel.id}` : `/discussions/apps/${appId}`}>
                                {channel.icon
                                    ? <img src={channel.icon} className={css({ objectFit: 'cover', borderRadius: theme.borders.radius300, width: theme.sizing.scale1200, height: theme.sizing.scale1200 })} alt={channel.name} />
                                    : <div className={css({
                                        borderRadius: theme.borders.radius300, width: theme.sizing.scale1200, height: theme.sizing.scale1200,
                                    })} title={channel.name}>
                                        <ChatAlt2 solid />
                                    </div>
                                }
                                <Block display='flex' flexDirection='column' gridGap='scale100' width='calc(100% - 56px)'>
                                    <LabelSmall color={channel.id == channelId ? '' : 'primary100'}>{channel.name}</LabelSmall>
                                    <LabelXSmall color={channel.id == channelId ? 'primary100' : 'primary300'} width='100%' whiteSpace='nowrap' overflow='hidden' textOverflow='ellipsis'>{channel.description}</LabelXSmall>
                                </Block>
                            </Link>
                        );
                    })}
                </Block>
            }
            {currentChannel &&
                <Block display='flex' alignItems='center' paddingTop='scale300' paddingBottom='scale300' paddingLeft='scale600' paddingRight='scale600'
                    justifyContent='space-between' backgroundColor='backgroundSecondary' marginBottom='scale600' overflow='hidden' overrides={{
                        Block: {
                            style: {
                                borderRadius: theme.borders.radius300, boxShadow: theme.lighting.shadow700
                            }
                        }
                    }}>
                    <Block display='flex' alignItems='center'>
                        <Block display='flex' alignItems='center' gridGap='scale100' marginRight='scale900'>
                            <ChatAlt2 width='24px' height='24px' solid />
                            <LabelSmall color='primary300' marginLeft='scale100'>
                                {currentChannel.meta?.discussions || 0} 个讨论
                            </LabelSmall>
                        </Block>
                        {channelId > 0 &&
                            <Block display='flex' alignItems='center' gridGap='scale100'>
                                {currentChannel?.moderators?.slice(0, 5).map((moderator, index) => (
                                    <Link key={index} className={css({ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', })} to={`/users/${moderator.id}`} title={moderator.name}>
                                        <img alt={moderator.name}
                                            className={css({ borderRadius: theme.borders.radius300, })}
                                            src={moderator.avatar} width="24px" height="24px" />
                                    </Link>
                                ))}
                                <LabelSmall color='primary300' marginLeft='scale100'>
                                    {currentChannel?.moderators?.length === 0 ? '暂无版主' : `${currentChannel?.moderators?.length}位版主`}
                                </LabelSmall>
                            </Block>
                        }
                    </Block>
                    {channelId > 0 && canSettingChannel &&
                        <Block display='flex' alignItems='center' title='设置频道' overrides={{
                            Block: {
                                style: {
                                    cursor: 'pointer',
                                }
                            }
                        }} onClick={() => {
                            setIsOpenChannelSettingModal(true);
                            setSettingForm({ id: currentChannel.id, name: currentChannel.name, icon: currentChannel.icon, description: currentChannel.description });
                        }}>
                            <Settings width='24px' height='24px' />
                        </Block>
                    }
                </Block>
            }
            <Discussions appId={appId} channelId={channelId} />
            <Modal onClose={() => setIsOpenChannelSettingModal(false)} closeable={false} isOpen={isOpenChannelSettingModal} role={ROLE.alertdialog} animate autoFocus>
                <ModalHeader>设置频道</ModalHeader>
                <ModalBody>
                    <Block display='flex' flexDirection='column'>
                        {submitErrorMessage && <Block><Notification kind='negative' message={submitErrorMessage} /></Block>}
                        <FormControl label={<LabelSmall>名称</LabelSmall>} caption={'最少一个字'}>
                            <Input size='compact' required value={settingForm?.name} onChange={e => setSettingForm({ ...settingForm, name: e.target.value })}></Input>
                        </FormControl>
                        <FormControl label={<LabelSmall>图标</LabelSmall>} caption={'非必需'}>
                            <Input size='compact' value={settingForm?.icon} onChange={e => setSettingForm({ ...settingForm, icon: e.target.value })}></Input>
                        </FormControl>
                        <FormControl label={<LabelSmall>描述</LabelSmall>} caption={'非必需'}>
                            <Input size='compact' value={settingForm?.description} onChange={e => setSettingForm({ ...settingForm, description: e.target.value })}></Input>
                        </FormControl>
                    </Block>
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenChannelSettingModal(false)}>关闭</ModalButton>
                    <ModalButton isLoading={isSubmitting} onClick={() => handleChannelSettingSubmit()}>保存</ModalButton>
                </ModalFooter>
            </Modal>
        </Block >
    );
}

function Discussions({ appId, channelId, }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [css, theme] = useStyletron();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(true);
    const [discussions, setDiscussions] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const [isOpenEditorModal, setIsOpenEditorModal] = React.useState(false);
    const [keyword, setKeyword] = React.useState('');

    // editor
    const [editorContent, setEditorContent] = React.useState('');
    const [editorTitle, setEditorTitle] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [canSubmit, setCanSubmit] = React.useState(false);
    const [submitErrorMessage, setSubmitErrorMessage] = React.useState(null);
    // editor end

    const handleDiscussionSubmit = async () => {
        setIsSubmitting(true);
        setSubmitErrorMessage(null);
        try {
            const res = await fetch(`/api/discussions`, {
                method: 'POST',
                body: JSON.stringify({ title: editorTitle, content: editorContent, appId, channelId, }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setIsOpenEditorModal(false);
                fetchDiscussions();
            } else {
                if (res.status === 400) {
                    const json = await res.json();
                    setSubmitErrorMessage(json.message);
                } else if (res.status === 401) {
                    navigate('/login');
                } else {
                    setSubmitErrorMessage(Messages.unknownError);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchDiscussions = React.useCallback(async (keyword = '', skip = 0) => {
        try {
            setIsLoading(true);
            setSkip(skip);
            setKeyword(keyword);
            if (skip === 0) setDiscussions([]);
            const res = await fetch(`/api/discussions/apps/${appId}/channels/${channelId}?keyword=${keyword}&skip=${skip}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                setDiscussions(prev => [...prev, ...json.data]);
                setHasMore(json.skip + json.limit < json.count);
            }
        } finally {
            setIsLoading(false);
        }
    }, [appId, channelId, limit]);

    React.useEffect(() => {
        fetchDiscussions();
    }, [fetchDiscussions]);

    React.useEffect(() => {
        if (!isOpenEditorModal) {
            setEditorContent('');
            setEditorTitle('');
            setSubmitErrorMessage(null);
        }
    }, [isOpenEditorModal]);

    React.useEffect(() => {
        dayjs.locale('zh-cn');
        dayjs.extend(relativeTime);
    }, []);

    return (
        <Block display='flex' flexDirection='column' width='100%'>
            <Block display='flex' alignItems='center' justifyContent='space-between' paddingTop='scale300' paddingBottom='scale600'>
                {channelId > 0 ? (user ? <Button size='compact' kind='secondary' onClick={() => setIsOpenEditorModal(true)}>发起新讨论</Button> : <Button size='compact' kind='secondary' onClick={e => {
                    e.preventDefault();
                    navigate('/login');
                }}>登录</Button>) : <Block></Block>}
                <Block display='flex' alignItems='center' gridGap='scale300'>
                    <Input value={keyword} size='compact' placeholder='搜索' onChange={e => setKeyword(e.target.value)} onKeyUp={e => e.key === 'Enter' && fetchDiscussions(keyword)} />
                    <Button size='compact' kind='secondary' onClick={() => fetchDiscussions(keyword)}><Search /></Button>
                </Block>
                <Modal onClose={() => setIsOpenEditorModal(false)} closeable={false} isOpen={isOpenEditorModal} role={ROLE.alertdialog} animate autoFocus>
                    <ModalHeader>发起新讨论</ModalHeader>
                    <ModalBody>
                        <Block display='flex' flexDirection='column'>
                            {submitErrorMessage && <Block><Notification kind='negative' message={submitErrorMessage} /></Block>}
                            <Block marginBottom='scale600'><Input size='compact' placeholder='弄个标题吧' value={editorTitle} onChange={e => setEditorTitle(e.target.value)} /></Block>
                            <Editor onUpdate={({ editor }) => {
                                setEditorContent(editor.getHTML());
                                setCanSubmit(editor.getText().length > 0 && editorTitle.length > 0);
                            }} />
                        </Block>
                    </ModalBody>
                    <ModalFooter>
                        <ModalButton kind='tertiary' onClick={() => setIsOpenEditorModal(false)}>关闭</ModalButton>
                        <ModalButton disabled={!canSubmit} onClick={() => handleDiscussionSubmit()} isLoading={isSubmitting}>发送</ModalButton>
                    </ModalFooter>
                </Modal>
            </Block>
            {discussions?.map((discussion, index) => {
                return (
                    <RouterLink key={index} href={`/discussions/${discussion.id}`}>
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
                            <Block display='flex' flexDirection='column' overflow='hidden'>
                                <LabelMedium marginBottom='scale200'>{discussion?.title}</LabelMedium>
                                <Block display='flex' alignItems='center' color='primary300' flexWrap>
                                    <LabelSmall whiteSpace='nowrap' color='inherit'>{discussion?.channel?.name}</LabelSmall>
                                    <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                    {discussion.isSticky &&
                                        <>
                                            <Pin width='16px' height='16px' />
                                            <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                        </>
                                    }
                                    {discussion.isClosed &&
                                        <>
                                            <Lock width='16px' height='16px' />
                                            <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                        </>
                                    }
                                    {discussion?.meta?.posts > 0 &&
                                        <>
                                            <Block display='flex' alignItems='center' gridGap='scale0' color='inherit'>
                                                <Message4 width='16px' height='16px' />
                                                <LabelSmall color='inherit'>{discussion?.meta?.posts || 0}</LabelSmall>
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
                                    <LabelSmall whiteSpace='nowrap' color='inherit' display='flex' alignItems='center' gridGap='scale0'>
                                        {discussion?.lastPost?.user?.name && <Reply width='16px' height='16px' />}
                                        @{discussion?.lastPost?.user ? discussion?.lastPost?.user.name : discussion?.user?.name}
                                    </LabelSmall>
                                    <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                    <LabelSmall whiteSpace='nowrap' color='inherit'>{dayjs(discussion?.createdAt).fromNow()}</LabelSmall>
                                </Block>
                            </Block>
                        </Block>
                    </RouterLink>
                );
            })
            }
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='56px' onClick={() => fetchDiscussions(keyword, skip + limit)} />
        </Block>
    );
}

function DiscussionsApp() {
    const { appId, channelId } = useParams();

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
                <Channels appId={appId} channelId={channelId} />
            </Block>
        </Block>
    );
}

export default DiscussionsApp;