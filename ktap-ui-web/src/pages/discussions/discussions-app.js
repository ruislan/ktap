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
import { LAYOUT_MAIN, MOBILE_BREAKPOINT, Messages } from '../../constants';
import RouterLink from '../../components/router-link';
import SplitBall from '../../components/split-ball';
import Notification from '../../components/notification';
import Editor from '../../components/editor';

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
            <Discussions appId={appId} channelId={channelId} />
        </Block >
    );
}

function Discussions({ appId, channelId, }) {
    const limit = 20;
    const [css, theme] = useStyletron();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(true);
    const [discussions, setDiscussions] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const [isOpenEditorModal, setIsOpenEditorModal] = React.useState(false);
    const keywordRef = React.useRef();

    // editor
    const [editorContent, setEditorContent] = React.useState('');
    const [editorTitle, setEditorTitle] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
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
                if (skip === 0) fetchDiscussions();
                else setSkip(0);
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

    const fetchDiscussions = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/discussions/apps/${appId}/channels/${channelId}?keyword=${keywordRef.current.value || ''}&skip=${skip}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                setDiscussions(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                setHasMore(json.skip + json.limit < json.count);
            }
        } finally {
            setIsLoading(false);
        }
    }, [appId, channelId, skip]);

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

    return (
        <Block display='flex' flexDirection='column' width='100%'>
            <Block display='flex' alignItems='center' justifyContent='space-between' paddingTop='scale300' paddingBottom='scale600'>
                {channelId > 0 ? (user ? <Button size='compact' kind='secondary' onClick={() => setIsOpenEditorModal(true)}>发起新讨论</Button> : <Button size='compact' kind='secondary' onClick={e => {
                    e.preventDefault();
                    navigate('/login');
                }}>登录</Button>) : <Block></Block>}
                <Block display='flex' alignItems='center' gridGap='scale300'>
                    <Input inputRef={keywordRef} size='compact' placeholder='搜索' onKeyUp={e => e.key === 'Enter' && fetchDiscussions()} />
                    <Button size='compact' kind='secondary' onClick={() => fetchDiscussions()}><Search /></Button>
                </Block>
                <Modal onClose={() => setIsOpenEditorModal(false)} closeable={false} isOpen={isOpenEditorModal} role={ROLE.alertdialog} animate autoFocus>
                    <ModalHeader>发起新讨论</ModalHeader>
                    <ModalBody>
                        <Block display='flex' flexDirection='column'>
                            {submitErrorMessage && <Block><Notification kind='negative' message={submitErrorMessage} /></Block>}
                            <Block marginBottom='scale600'><Input size='compact' placeholder='弄个标题吧' value={editorTitle} onChange={e => setEditorTitle(e.target.value)} /></Block>
                            <Editor onUpdate={({ editor }) => setEditorContent(editor.getHTML())} />
                        </Block>
                    </ModalBody>
                    <ModalFooter>
                        <ModalButton kind='tertiary' onClick={() => setIsOpenEditorModal(false)}>关闭</ModalButton>
                        <ModalButton onClick={() => handleDiscussionSubmit()} isLoading={isSubmitting}>发送</ModalButton>
                    </ModalFooter>
                </Modal>
            </Block>
            {discussions?.length === 0 ?
                <LabelSmall marginTop='scale600' alignSelf='center' color='primary500'>无内容</LabelSmall> :
                discussions.map((discussion, index) => {
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
                                <Block display='flex' flexDirection='column' flex='1'>
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
                                        <LabelSmall whiteSpace='nowrap' color='inherit' display='flex' alignItems='center' gridGap='scale0'>
                                            {discussion?.last?.user?.name && <Reply width='16px' height='16px' />}
                                            @{discussion?.last?.user ? discussion?.last?.user.name : discussion?.user?.name}
                                        </LabelSmall>
                                        <SplitBall color='rgb(151, 151, 151)' gap='6px' />
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

function DiscussionsApp() {
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

export default DiscussionsApp;