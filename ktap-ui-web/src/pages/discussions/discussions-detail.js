import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAuth } from '../../hooks/use-auth';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Skeleton } from 'baseui/skeleton';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, ROLE } from 'baseui/modal';
import RouterLink from '../../components/router-link';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LabelLarge, LabelSmall, LabelMedium, HeadingXSmall, LabelXSmall, ParagraphSmall } from 'baseui/typography';
import { Message4, Star, ThumbUp, ThumbDown, Gift, Hand, Quote } from '../../components/icons';
import { LAYOUT_LEFT, LAYOUT_MAIN, LAYOUT_RIGHT, MOBILE_BREAKPOINT, Styles } from '../../constants';
import SideBox from '../../components/side-box';
import AvatarSquare from '../../components/avatar-square';
import GenderLabel from '../../components/gender-label';
import GiftType from '../../components/gift';
import Editor from './editor';

import '../../assets/css/post.css';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

function AppGlance({ app }) {
    const [css, theme] = useStyletron();
    const navigate = useNavigate();
    return (
        <SideBox>
            <Block width='100%' maxHeight='168px' overflow='hidden'>
                <img width='100%' className={css({ borderRadius: theme.borders.radius300 })} src={app.media?.head?.image}></img>
            </Block>
            <Block display='flex' justifyContent='space-between' alignItems='center' padding='scale600'>
                <Block display='flex' alignItems='center'>
                    <Block display='flex' flexDirection='column'>
                        <LabelMedium marginBottom='scale100' overrides={{
                            Block: {
                                style: {
                                    inlineSize: '168px',
                                    whiteSpace: 'break-spaces',
                                }
                            }
                        }}>{app.name}</LabelMedium>
                        <Block display='flex' alignItems='center' justifyContent='flex-start'>
                            <Block marginRight='scale0' font='font300'>{app.score}</Block>
                            <Star width='20px' height='20px' />
                        </Block>
                    </Block>
                </Block>
                <Block>
                    <Button kind='secondary' onClick={() => navigate(`/apps/${app.id}`)}>详情</Button>
                </Block>
            </Block>
        </SideBox>
    );
}

function DiscussionMeta({ discussion }) {
    // const [isLoading, setIsLoading] = React.useState(false);
    const { user } = useAuth();
    const [canEdit, setCanEdit] = React.useState(false);
    const [isOpenEditorModal, setIsOpenEditorModal] = React.useState(false);

    React.useEffect(() => {
        if (user && discussion?.user?.id) {
            setCanEdit(user.id === discussion.user.id);
        }
    }, [user, discussion]);

    return (
        <SideBox title='讨论信息'>
            <Block display='flex' flexDirection='column' paddingTop='0' paddingLeft='scale600' paddingRight='scale600' paddingBottom='scale600'>
                <Block display='grid' gridTemplateColumns='1fr 3fr' gridGap='scale300'>
                    <LabelSmall color='primary200'>发布日期</LabelSmall>
                    <LabelSmall color='primary'>{dayjs(discussion.createdAt).format('YYYY-MM-DD HH:ss')}</LabelSmall>
                    <LabelSmall color='primary200'>贴子总数</LabelSmall>
                    <LabelSmall color='primary'>{discussion?.meta?.posts || 0}</LabelSmall>
                    <LabelSmall color='primary200'>参与人数</LabelSmall>
                    <LabelSmall color='primary'>{discussion?.meta?.users || 0}</LabelSmall>
                    <LabelSmall color='primary200'>礼物总数</LabelSmall>
                    <LabelSmall color='primary'>{discussion?.meta?.gifts || 0}</LabelSmall>
                </Block>
                <Block display='flex' alignItems='center' width='100%' marginTop='scale600' gridGap='scale300'>
                    {!discussion.isClosed && <Button kind='secondary' size='compact' onClick={() => { setIsOpenEditorModal(true); }}>回复</Button>}
                    {canEdit &&
                        <>
                            {!discussion.isSticky && <Button kind='secondary' size='compact' onClick={() => { }}>置顶</Button>}
                            {discussion.isSticky && <Button kind='secondary' size='compact' onClick={() => { }}>取消置顶</Button>}
                            <Button kind='secondary' size='compact' onClick={() => { }}>关闭</Button>
                            <Button kind='secondary' size='compact' onClick={() => { }}>删除</Button>
                        </>
                    }
                </Block>
            </Block>
            <Modal onClose={() => setIsOpenEditorModal(false)}
                closeable={false}
                isOpen={isOpenEditorModal}
                animate
                autoFocus
                role={ROLE.alertdialog}
            >
                <ModalHeader>回复</ModalHeader>
                <ModalBody>
                    <Editor />
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenEditorModal(false)}>关闭</ModalButton>
                    <ModalButton onClick={() => { }}>发送</ModalButton>
                </ModalFooter>
            </Modal>
        </SideBox>
    );
}

function OtherDiscussions({ discussionId }) {
    const [css, theme] = useStyletron();
    const [discussions, setDiscussions] = React.useState([]);
    const [isLoading, setLoading] = React.useState(true);
    React.useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/discussions/${discussionId}/others?limit=10`);
                if (res.ok) {
                    const json = await res.json();
                    setDiscussions(json.data);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [discussionId]);
    return (
        <SideBox title='其他主题'>
            <Block display='flex' flexDirection='column' gridGap='scale100' paddingLeft='scale300' paddingRight='scale300' paddingBottom='scale600'>
                {isLoading ?
                    [...Array(3)].map((_, index) => (<Skeleton key={index} width='100%' height='32px' animation />)) :
                    discussions.map((discussion, index) => (
                        <Link key={index} to={`/discussions/${discussion.id}`} className={css({
                            textDecoration: 'none', display: 'flex', gap: theme.sizing.scale300, alignItems: 'center', justifyContent: 'space-between',
                            padding: theme.sizing.scale300, borderRadius: theme.borders.radius200, color: 'inherit',
                            backgroundColor: 'rgba(109, 109, 109, 0.1)',
                            cursor: 'pointer',
                            ':hover': {
                                backgroundColor: 'rgba(109, 109, 109, 0.3)',
                            },
                        })}>
                            <LabelSmall color='primary100' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>{discussion.title}</LabelSmall>
                            <Block display='flex' alignItems='center' gridGap='scale100'>
                                <Message4 width='16px' height='16px' />
                                <LabelSmall color='inherit'>{discussion.meta.posts}</LabelSmall>
                            </Block>
                        </Link>
                    ))
                }
            </Block>
        </SideBox>
    );
}

function DiscussionPostActions({ discussionId, post }) {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [isDoingThumbUp, setIsDoingThumbUp] = React.useState(false);
    const [isDoingThumbDown, setIsDoingThumbDown] = React.useState(false);
    const [isActiveThumbUp, setIsActiveThumbUp] = React.useState(post.viewer?.direction === 'up');
    const [isActiveThumbDown, setIsActiveThumbDown] = React.useState(post.viewer?.direction === 'down');
    const [isOpenGiftModal, setIsOpenGiftModal] = React.useState(false);
    const [gifts, setGifts] = React.useState([]);
    const [checkedGift, setCheckedGift] = React.useState(null);
    const [isOpenGiftConfirmModal, setIsOpenGiftConfirmModal] = React.useState(false);
    const [isSendingGift, setIsSendingGift] = React.useState(false);

    const handleThumb = async (direction) => {
        if (!user) { navigate('/login'); return; }
        direction === 'up' && setIsDoingThumbUp(true);
        direction === 'down' && setIsDoingThumbDown(true);
        try {
            const res = await fetch(`/api/discussions/${discussionId}/posts/${post.id}/thumb/${direction}`, { method: 'POST' });
            if (res.ok) {
                const json = await res.json();
                post.meta.ups = json.data?.ups;
                post.meta.downs = json.data?.downs;

                direction === 'up' && (setIsActiveThumbDown(false) || setIsActiveThumbUp(prev => !prev));
                direction === 'down' && (setIsActiveThumbUp(false) || setIsActiveThumbDown(prev => !prev));
            }
        } finally {
            direction === 'up' && setIsDoingThumbUp(false);
            direction === 'down' && setIsDoingThumbDown(false);
        }
    };

    const handleGift = async () => {
        if (!user) { navigate('/login'); return; }
        setIsOpenGiftModal(true);
        setCheckedGift(null);
        const giftsRes = await fetch(`/api/gifts`);
        if (giftsRes.ok) {
            const json = await giftsRes.json();
            setGifts(json.data);
        }
    };

    const handleSendGift = async () => {
        if (!user) { navigate('/login'); return; }
        try {
            setIsSendingGift(true);
            const res = await fetch(`/api/discussions/${discussionId}/posts/${post.id}/gifts/${checkedGift.id}`, { method: 'POST' });
            if (res.ok) {
                const json = await res.json();
                setUser({ ...user, balance: user.balance - checkedGift.price });
                post.meta.gifts = json.count;
                post.gifts = json.data;
                setIsOpenGiftConfirmModal(false); // close confirm
            }
        } finally {
            setIsSendingGift(false);
        }
    };

    return (
        <>
            <Block display='flex' flexDirection='column' width='100%' marginTop='scale600'>
                <Block display='flex' width='100%' justifyContent='space-between' alignItems='center'>
                    <Block display='flex' gridGap='scale100'>
                        <Button kind='secondary' size='mini' onClick={() => handleThumb('up')} startEnhancer={() => <ThumbUp width={16} height={16} />} overrides={Styles.Button.Act} isSelected={isActiveThumbUp} isLoading={isDoingThumbUp}>
                            赞 {post?.meta?.ups || 0}
                        </Button>
                        <Button kind='secondary' size='mini' onClick={() => handleThumb('down')} overrides={Styles.Button.Act} isSelected={isActiveThumbDown} isLoading={isDoingThumbDown} startEnhancer={() => <ThumbDown width={16} height={16} />}>
                            踩 {post?.meta?.downs || 0}
                        </Button>
                        <Button kind='secondary' size='mini' onClick={() => handleGift()} overrides={Styles.Button.Act} startEnhancer={() => <Gift width={16} height={16} />}>
                            赏 {post?.meta?.gifts || 0}
                        </Button>
                    </Block>
                    <Block display='flex' gridGap='scale100'>
                        <Button kind='secondary' size='mini' onClick={() => { }} overrides={Styles.Button.Act} title='引用'><Quote width={16} height={16} /></Button>
                        <Button kind='secondary' size='mini' onClick={() => { }} overrides={Styles.Button.Act} title='举报'><Hand width={16} height={16} /></Button>
                    </Block>
                </Block>
                {post?.meta?.gifts > 0 && post?.gifts &&
                    <Block display='flex' flexDirection='column' marginTop='scale600' gridGap='scale300'>
                        <LabelSmall color='primary400'>收到的礼物：</LabelSmall>
                        <Block display='flex' gridGap='scale100' flexWrap width='100%'>
                            {post?.gifts.map((gift, index) =>
                                <GiftType key={index} src={gift.url} name={gift.name} number={gift.count} description={gift.description} price={gift.price} />)
                            }
                        </Block>
                    </Block>
                }
            </Block>

            <Modal onClose={() => setIsOpenGiftModal(false)} isOpen={isOpenGiftModal} animate autoFocus role={ROLE.dialog}>
                <ModalHeader>请选择礼物</ModalHeader>
                <ModalBody $as='div'>
                    <Block display='flex' flexWrap='wrap' justifyContent='flex-start' overflow='scroll' maxHeight='600px'>
                        {gifts && gifts.map((gift, index) => (
                            <Block key={index} display='flex' flexDirection='column' alignItems='center' width='128px'
                                margin='scale300' padding='scale300'
                                onClick={() => setCheckedGift(prev => prev?.id === gift.id ? null : gift)}
                                overrides={{
                                    Block: {
                                        style: ({ $theme }) => ({
                                            cursor: 'pointer',
                                            borderRadius: $theme.borders.radius300,
                                            backgroundColor: gift.id === checkedGift?.id ? $theme.colors.backgroundTertiary : 'inherit',
                                            ':hover': {
                                                backgroundColor: $theme.colors.backgroundTertiary
                                            }
                                        })
                                    }
                                }}
                            >
                                <img src={gift.url} width='80px' height='80px' />
                                <LabelXSmall marginTop='scale100' color='primary200'>{gift.name}</LabelXSmall>
                                <LabelXSmall flex={1} marginTop='scale300' color='primary200'>{gift.description}</LabelXSmall>
                                <LabelXSmall marginTop='scale300' color='primary300'>价值：{gift.price}</LabelXSmall>
                            </Block>
                        ))}
                    </Block>
                </ModalBody>
                <ModalFooter>
                    <Block display='flex' alignItems='center' justifyContent='space-between'>
                        <Block display='flex' flexDirection='column' alignItems='flex-start'>
                            <LabelXSmall>您的余额</LabelXSmall>
                            <LabelLarge>{user?.balance || 0}</LabelLarge>
                        </Block>
                        <Block>
                            <ModalButton kind='tertiary' onClick={() => setIsOpenGiftModal(false)}>取消</ModalButton>
                            <Button disabled={!checkedGift || checkedGift.price > (user?.balance || 0)} onClick={() => {
                                setIsOpenGiftModal(false);
                                setIsOpenGiftConfirmModal(true);
                            }}>继续</Button>
                        </Block>
                    </Block>
                </ModalFooter>
            </Modal>
            <Modal onClose={() => setIsOpenGiftConfirmModal(false)} isOpen={isOpenGiftConfirmModal} animate autoFocus role={ROLE.alertdialog}>
                <ModalHeader>送出礼物</ModalHeader>
                <ModalBody>
                    <Block display='flex' alignItems='center'>
                        <img src={checkedGift?.url} width='196px' height='196px' />
                        <Block display='flex' flexDirection='column' marginLeft='scale600'>
                            <ParagraphSmall>请您确认送出礼物 <b>{checkedGift?.name}</b></ParagraphSmall>
                            <ParagraphSmall>送出礼物将扣除余额 <b>{checkedGift?.price}</b></ParagraphSmall>
                            <ParagraphSmall>此礼物送出后将立即生效，这是一个<b>不可逆操作</b></ParagraphSmall>
                        </Block>
                    </Block>
                </ModalBody>
                <ModalFooter>
                    <Block display='flex' alignItems='center' justifyContent='space-between'>
                        <Block display='flex' flexDirection='column' alignItems='flex-start'>
                            <LabelXSmall>您的余额</LabelXSmall>
                            <LabelLarge>{user?.balance || 0}</LabelLarge>
                        </Block>
                        <Block>
                            <ModalButton kind='tertiary' onClick={() => {
                                setIsOpenGiftModal(true);
                                setIsOpenGiftConfirmModal(false);
                            }}>返回</ModalButton>
                            <Button disabled={!checkedGift} isLoading={isSendingGift} onClick={() => handleSendGift()}>确定</Button>
                        </Block>
                    </Block>
                </ModalFooter>
            </Modal>
        </>
    );
}


function DiscussionPosts({ discussion }) {
    const limit = 20;
    const { user } = useAuth();
    const [, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(false);
    const [dataList, setDataList] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);

    const fetchDataList = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/discussions/${discussion.id}/posts?skip=${skip}&limit${limit}`);
            if (res.ok) {
                const json = await res.json();
                if (user && json.data && json.data.length > 0) {
                    const thumbRes = await fetch(`/api/user/effect/discussion-posts/thumbs?ids=${json.data.map(v => v.id).join(',')}`);
                    const thumbJson = await thumbRes.json();
                    json.data.forEach(post => post.viewer = { direction: thumbJson.data[post.id] });
                }
                setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                setHasMore(json.skip + json.limit < json.count);
            }
        } finally {
            setIsLoading(false);
        }
    }, [discussion.id, skip, user]);

    React.useEffect(() => {
        fetchDataList();
    }, [fetchDataList]);

    return (
        <Block display='flex' flexDirection='column' gridGap='scale600'>
            {dataList?.map((post, index) => {
                return (
                    <Block key={index} display='flex' flexDirection='column' backgroundColor='backgroundSecondary' padding='scale600' overrides={{
                        Block: { style: { borderRadius: theme.borders.radius300 } }
                    }}>
                        <Block display='flex' alignItems='center' gridGap='scale300'>
                            <AvatarSquare size='scale1000' src={post.user.avatar} />
                            <Block display='flex' alignItems='center' justifyContent='space-between' flex='1'>
                                <Block display='flex' flexDirection='column'>
                                    <Block display='flex' alignItems='center' marginBottom='scale100'>
                                        <LabelMedium marginRight='scale100'><RouterLink href={`/users/${post.user.id}`}>{post.user.name}</RouterLink></LabelMedium>
                                        <GenderLabel gender={post.user.gender} />
                                    </Block>
                                    <LabelXSmall color='primary100' marginRight='scale100'>{post.user.title}</LabelXSmall>
                                </Block>
                            </Block>
                        </Block>
                        <LabelSmall color='primary500' marginTop='scale600'>编辑于：{dayjs(post.updatedAt).format('YYYY 年 M 月 D 日')}</LabelSmall>
                        <Block paddingTop='scale600' paddingBottom='scale600'>
                            <div dangerouslySetInnerHTML={{ __html: post.content }} className='post'></div>
                        </Block>
                        <DiscussionPostActions discussionId={discussion.id} post={post} />
                    </Block>
                );
            })}
            {hasMore &&
                <Block marginTop='scale600' display='flex' justifyContent='center' alignItems='center'>
                    <Button onClick={() => setSkip(prev => prev + limit)} kind='tertiary' isLoading={isLoading} disabled={!hasMore}>查看更多</Button>
                </Block>
            }
        </Block>
    );
}

function DiscussionsDetail() {
    const { appId, id } = useParams();
    const [, theme] = useStyletron();

    const [discussion, setDiscussion] = React.useState({});
    const [isLoadingDiscussion, setIsLoadingDiscussion] = React.useState(true);

    React.useEffect(() => {
        if (id > 0) {
            (async () => {
                try {
                    setIsLoadingDiscussion(true);
                    const res = await fetch(`/api/discussions/${id}`);
                    if (res.ok) {
                        const json = await res.json();
                        setDiscussion(json.data);
                    }
                } finally {
                    setIsLoadingDiscussion(false);
                }
            })();
        }
    }, [id]);

    return (
        <Block display='flex' flexDirection='column' width={LAYOUT_MAIN} marginTop='scale900' overrides={{
            Block: {
                style: {
                    [MOBILE_BREAKPOINT]: {
                        width: '100%',
                        marginTop: theme.sizing.scale600, paddingLeft: theme.sizing.scale300, paddingRight: theme.sizing.scale300,
                    }
                }
            }
        }}>
            <Block display='flex' width='100%' alignItems='center' gridGap='scale300' marginBottom='scale800'>
                <RouterLink href={`/apps/${discussion?.app?.id}`} kind='underline'><LabelSmall>{discussion?.app?.name}</LabelSmall></RouterLink> /
                <RouterLink href={`/discussions/apps/${discussion?.app?.id}`} kind='underline'><LabelSmall>{discussion?.channel?.name}</LabelSmall></RouterLink> /
                <LabelSmall>讨论详情</LabelSmall>
            </Block>
            <Block display='flex' width='100%' flexDirection='column' backgroundColor='backgroundSecondary' padding='scale700' marginBottom='scale600'
                overrides={{
                    Block: { style: { borderRadius: theme.borders.radius300, boxShadow: theme.lighting.shadow500, } }
                }}
            >
                <HeadingXSmall margin='0'>{discussion.title}</HeadingXSmall>
            </Block>
            <Block display='flex' width='100%' overrides={{
                Block: { style: { [MOBILE_BREAKPOINT]: { flexDirection: 'column', gap: theme.sizing.scale900 } } }
            }}>
                <Block display='flex' flexDirection='column' width={LAYOUT_LEFT} marginRight='scale300' overrides={{
                    Block: { style: { [MOBILE_BREAKPOINT]: { width: '100%', marginRight: 0, } } }
                }}>
                    {!isLoadingDiscussion && <DiscussionPosts discussion={discussion} />}
                </Block>
                <Block display='flex' flexDirection='column' width={LAYOUT_RIGHT} marginLeft='scale300' overrides={{
                    Block: { style: { [MOBILE_BREAKPOINT]: { width: '100%', marginLeft: 0, } } }
                }}>
                    {!isLoadingDiscussion && <DiscussionMeta discussion={discussion} />}
                    {!isLoadingDiscussion && <AppGlance app={discussion?.app} />}
                    {!isLoadingDiscussion && <OtherDiscussions appId={appId} discussionId={discussion.id} />}
                </Block>
            </Block>
        </Block>
    );
}

export default DiscussionsDetail;