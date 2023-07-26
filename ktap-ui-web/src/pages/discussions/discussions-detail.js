import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStyletron } from 'baseui';
import { useAuth } from '../../hooks/use-auth';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Skeleton } from 'baseui/skeleton';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, ROLE } from 'baseui/modal';
import { Textarea } from 'baseui/textarea';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import RouterLink from '../../components/router-link';
import { LabelLarge, LabelSmall, LabelMedium, HeadingXSmall, LabelXSmall, ParagraphSmall } from 'baseui/typography';
import { Message4, Star, ThumbUp, ThumbDown, Gift, Hand, Quote, TrashBin, Pin, Lock, Update as UpdateIcon } from '../../components/icons';
import { LAYOUT_LEFT, LAYOUT_MAIN, LAYOUT_RIGHT, MOBILE_BREAKPOINT, Styles } from '../../constants';
import SideBox from '../../components/side-box';
import AvatarSquare from '../../components/avatar-square';
import GenderLabel from '../../components/gender-label';
import GiftType from '../../components/gift';
import Editor from '../../components/editor';

import '../../assets/css/post.css';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

function UserPanel({ id, name, avatar, gender, title }) {
    return (
        <Block display='flex' alignItems='center' gridGap='scale300'>
            <AvatarSquare size='scale1000' src={avatar} />
            <Block display='flex' alignItems='center' justifyContent='space-between' flex='1'>
                <Block display='flex' flexDirection='column'>
                    <Block display='flex' alignItems='center' marginBottom='scale100'>
                        <LabelMedium marginRight='scale100'><RouterLink href={`/users/${id}`}>{name}</RouterLink></LabelMedium>
                        <GenderLabel gender={gender} />
                    </Block>
                    <LabelXSmall color='primary100' marginRight='scale100'>{title}</LabelXSmall>
                </Block>
            </Block>
        </Block>
    );
}

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

function DiscussionMeta({ discussion, onChange = () => { } }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoadingSticky, setIsLoadingSticky] = React.useState(false);
    const [isLoadingClose, setIsLoadingClose] = React.useState(false);
    const [isSticky, setIsSticky] = React.useState(discussion?.isSticky);
    const [isClosed, setIsClosed] = React.useState(discussion?.isClosed);

    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);

    const [isUpdating, setIsUpdating] = React.useState(false);
    const [isOpenUpdateModal, setIsOpenUpdateModal] = React.useState(false);
    const [title, setTitle] = React.useState(discussion?.title);

    const [operations, setOperations] = React.useState({ sticky: false, close: false, delete: false, update: false });

    const handleSticky = async ({ sticky }) => {
        setIsLoadingSticky(true);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}/sticky`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sticky })
            });
            if (res.ok) {
                setIsSticky(sticky);
                onChange({ sticky });
            }
        } finally {
            setIsLoadingSticky(false);
        }
    };

    const handleClose = async ({ close }) => {
        setIsLoadingClose(true);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}/close`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ close })
            });
            if (res.ok) {
                setIsClosed(close);
                onChange({ close });
            }
        } finally {
            setIsLoadingClose(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}`, { method: 'DELETE' });
            if (res.ok) {
                // back to channel
                navigate(`/discussions/apps/${discussion.app.id}/channels/${discussion.channel.id}`);
            }
        } finally {
            setIsDeleting(false);
            setIsOpenDeleteConfirmModal(false);
        }
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
            if (res.ok) {
                onChange({ title });
            }
        } finally {
            setIsUpdating(false);
            setIsOpenUpdateModal(false);
        }
    };

    React.useEffect(() => {
        const isModerator = discussion.channel.moderators.some(mId => mId == user?.id);
        const isAdmin = user && user.isAdmin;
        const isOwner = user && discussion?.user && user.id === discussion.user.id;
        setOperations({
            sticky: isAdmin || isModerator,
            close: isAdmin || isModerator || isOwner,
            delete: isAdmin || isModerator || isOwner,
            update: isAdmin || isModerator || isOwner,
        });
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
                    {operations.sticky && !isSticky && <Button kind='secondary' size='compact' isLoading={isLoadingSticky} onClick={() => handleSticky({ sticky: true })}>置顶</Button>}
                    {operations.sticky && isSticky && <Button kind='secondary' size='compact' isLoading={isLoadingSticky} onClick={() => handleSticky({ sticky: false })}>取消置顶</Button>}
                    {operations.close && !isClosed && <Button kind='secondary' size='compact' isLoading={isLoadingClose} onClick={() => handleClose({ close: true })}>关闭</Button>}
                    {operations.close && isClosed && <Button kind='secondary' size='compact' isLoading={isLoadingClose} onClick={() => handleClose({ close: false })}>打开</Button>}
                    {operations.update && !isClosed && <Button kind='secondary' size='compact' onClick={() => { setIsOpenUpdateModal(true); setTitle(discussion.title); }}>编辑</Button>}
                    {operations.delete && <Button kind='secondary' size='compact' onClick={() => setIsOpenDeleteConfirmModal(true)}>删除</Button>}
                </Block>
            </Block>
            <Modal onClose={() => setIsOpenDeleteConfirmModal(false)} closeable={false} isOpen={isOpenDeleteConfirmModal}
                animate autoFocus role={ROLE.alertdialog}
            >
                <ModalHeader>是否删除讨论？</ModalHeader>
                <ModalBody>您确定要删除这个讨论吗？相关的帖子，以及帖子和礼物等将会一并删除。该操作<b>不能撤消</b>。</ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenDeleteConfirmModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleDelete()} isLoading={isDeleting}>确定</ModalButton>
                </ModalFooter>
            </Modal>
            <Modal onClose={() => setIsOpenUpdateModal(false)} closeable={false} isOpen={isOpenUpdateModal}
                animate autoFocus role={ROLE.alertdialog}
            >
                <ModalHeader>编辑讨论主题</ModalHeader>
                <ModalBody>
                    <FormControl label='主题'>
                        <Input value={title} onChange={e => setTitle(e.target.value)} />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenUpdateModal(false)}>取消</ModalButton>
                    <ModalButton disabled={title.length === 0} onClick={() => handleUpdate()} isLoading={isUpdating}>确定</ModalButton>
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

function DiscussionPostActions({ discussion, post, isFirst = false, onQuoteClick = () => { }, afterThumbed = () => { }, afterDeleted = () => { }, onUpdateClick = () => { } }) {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [isDoingThumbUp, setIsDoingThumbUp] = React.useState(false);
    const [isDoingThumbDown, setIsDoingThumbDown] = React.useState(false);
    const [isActiveThumbUp, setIsActiveThumbUp] = React.useState(false);
    const [isActiveThumbDown, setIsActiveThumbDown] = React.useState(false);
    // gift
    const [isOpenGiftModal, setIsOpenGiftModal] = React.useState(false);
    const [gifts, setGifts] = React.useState([]);
    const [checkedGift, setCheckedGift] = React.useState(null);
    const [isOpenGiftConfirmModal, setIsOpenGiftConfirmModal] = React.useState(false);
    const [isSendingGift, setIsSendingGift] = React.useState(false);
    // end gift
    // report
    const [reportContent, setReportContent] = React.useState('');
    const [isOpenReportModal, setIsOpenReportModal] = React.useState(false);
    const [isReporting, setIsReporting] = React.useState(false);
    const [isReported, setIsReported] = React.useState(true);
    // end report
    // delete post
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    // end delete post

    const [operations, setOperations] = React.useState({ update: false, delete: false });

    const handleThumb = async (direction) => {
        if (!user) { navigate('/login'); return; }
        direction === 'up' && setIsDoingThumbUp(true);
        direction === 'down' && setIsDoingThumbDown(true);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}/posts/${post.id}/thumb/${direction}`, { method: 'POST' });
            if (res.ok) {
                const json = await res.json();
                post.meta.ups = json.data?.ups;
                post.meta.downs = json.data?.downs;

                direction === 'up' && (setIsActiveThumbDown(false) || setIsActiveThumbUp(prev => !prev));
                direction === 'down' && (setIsActiveThumbUp(false) || setIsActiveThumbDown(prev => !prev));

                afterThumbed({ direction });
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
            const res = await fetch(`/api/discussions/${discussion.id}/posts/${post.id}/gifts/${checkedGift.id}`, { method: 'POST' });
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

    const handleReport = async () => {
        if (!user) { navigate('/login'); return; }
        setIsReporting(true);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}/posts/${post.id}/report`, {
                method: 'POST',
                body: JSON.stringify({ content: reportContent }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setIsReported(true);
                setIsOpenReportModal(false);
            }
        } finally {
            setIsReporting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}/posts/${post.id}`, { method: 'DELETE' });
            if (res.ok) afterDeleted();
        } finally {
            setIsDeleting(false);
            setIsOpenDeleteConfirmModal(false);
        }
    };

    React.useEffect(() => {
        (async () => {
            if (user && user.id !== post.user.id) {
                const res = await fetch(`/api/user/effect/discussions/posts/${post.id}/report`);
                if (res.ok) {
                    const json = await res.json();
                    setIsReported(json.data.reported || false);
                }
            }
        })();
        setIsActiveThumbUp(post.viewer?.direction === 'up');
        setIsActiveThumbDown(post.viewer?.direction === 'down');
    }, [user, post]);


    React.useEffect(() => {
        const isModerator = discussion.channel.moderators.some(mId => mId == user?.id);
        const isAdmin = user && user.isAdmin;
        const isOwner = user && post?.user && user.id === post.user.id;
        setOperations({
            delete: isAdmin || isModerator || isOwner,
            update: isAdmin || isModerator || isOwner,
        });
    }, [user, discussion, post]);

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
                        {!discussion.isClosed && <Button kind='secondary' size='mini' onClick={() => onQuoteClick()} overrides={Styles.Button.Act} title='引用回复'><Quote width={16} height={16} /></Button>}
                        {user && !isReported && user.id !== post.user?.id &&
                            <>
                                <Button kind='secondary' size='mini' onClick={() => { setIsOpenReportModal(true); setReportContent(''); }} overrides={Styles.Button.Act} title='举报'><Hand width={16} height={16} /></Button>
                                <Modal onClose={() => setIsOpenReportModal(false)} closeable={false} isOpen={isOpenReportModal} animate autoFocus role={ROLE.alertdialog}>
                                    <ModalHeader>举报评测</ModalHeader>
                                    <ModalBody>
                                        <LabelSmall marginBottom='scale600'>请输入您举报该帖子的理由，如果理由不够充分，该操作无效。举报操作无法撤消。</LabelSmall>
                                        <Textarea readOnly={isReporting} placeholder='请注意文明用语，否则视为无效举报'
                                            rows='3' maxLength='150' value={reportContent} onChange={(e) => setReportContent(e.target.value)} />
                                    </ModalBody>
                                    <ModalFooter>
                                        <ModalButton kind='tertiary' onClick={() => setIsOpenReportModal(false)}>取消</ModalButton>
                                        <Button kind='primary' isLoading={isReporting} onClick={() => handleReport()}>确定</Button>
                                    </ModalFooter>
                                </Modal>
                            </>
                        }
                        {operations.update && !discussion.isClosed &&
                            <Button kind='secondary' size='mini' title='编辑' onClick={() => onUpdateClick()}><UpdateIcon width={16} height={16} /></Button>
                        }
                        {operations.delete && !isFirst && !discussion.isClosed &&
                            <Button kind='secondary' size='mini' title='删除' onClick={() => { setIsOpenDeleteConfirmModal(true); }}><TrashBin width={16} height={16} /></Button>
                        }
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
            <Modal onClose={() => setIsOpenDeleteConfirmModal(false)}
                closeable={false}
                isOpen={isOpenDeleteConfirmModal}
                animate
                autoFocus
                role={ROLE.alertdialog}
            >
                <ModalHeader>是否删除该贴？</ModalHeader>
                <ModalBody>您确定要删除这个帖子吗？相关的礼物等将会一并删除。该操作<b>不能撤消</b>。</ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenDeleteConfirmModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleDelete()} isLoading={isDeleting}>确定</ModalButton>
                </ModalFooter>
            </Modal>
        </>
    );
}


function DiscussionPostUpdater({ discussion, post, afterUpdate = () => { }, onCancelClick = () => { } }) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [canSubmit, setCanSubmit] = React.useState(false);
    const [editor, setEditor] = React.useState();

    const handlePostSubmit = async () => {
        setIsSubmitting(true);
        try {
            const content = editor.getHTML();
            const res = await fetch(`/api/discussions/${discussion.id}/posts/${post.id}`, {
                method: 'PUT',
                body: JSON.stringify({ content }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                afterUpdate({ content });
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <Block paddingTop='scale600' paddingBottom='scale600'>
            {post.isEditing ? (
                <Block display='flex' flexDirection='column' gridGap='scale600'>
                    <Block>
                        <Editor initContent={post.content} onCreate={({ editor }) => setEditor(editor)} onUpdate={({ editor }) => setCanSubmit(editor.getText().length > 0)} />
                    </Block>
                    <Block display='flex' justifyContent='flex-end' alignItems='center' gridGap='scale300'>
                        <Button size='compact' kind='tertiary' onClick={() => onCancelClick()}>取消</Button>
                        <Button size='compact' kind='primary' disabled={!canSubmit} isLoading={isSubmitting} onClick={() => handlePostSubmit()}>保存</Button>
                    </Block>
                </Block>
            ) : (
                <div dangerouslySetInnerHTML={{ __html: post.content }} className='post'></div>
            )}
        </Block>
    );
}

// 回复讨论的帖子直接追加到当前最后一贴的后面，如果用户点击“查看更多”，
// 后续的帖子中如果没有包含新帖，则保持该贴在最后一贴的后面。
// 后续的帖子中如果包含了新帖，则将这个保持在最后的帖子取消掉。
// XXX 新帖子在删除前，最好有个标志来标记它是新放进去的。
function DiscussionPosts({ discussion }) {
    const limit = 20;
    const { user } = useAuth();
    const [, theme] = useStyletron();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const [dataList, setDataList] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);


    // editor
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [canSubmit, setCanSubmit] = React.useState(false);
    const [editor, setEditor] = React.useState();
    const [newPosts, setNewPosts] = React.useState([]);

    const handlePostSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}/posts`, {
                method: 'POST',
                body: JSON.stringify({ content: editor.getHTML() }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                const json = await res.json();
                setNewPosts(prev => [...prev, {
                    ...json.data,
                    user, gifts: [], meta: { up: 0, downs: 0, gifts: 0 },
                }]);
                editor?.chain().focus().clearContent().run();
            } else {
                throw { status: res.status };
            }
        } catch (error) {
            if (error?.status === 403) navigate('/login');
            else if (error?.status === 404) navigate('/not-found', { replace: true });
            else navigate('/not-work');
        } finally {
            setIsSubmitting(false);
        }
    };
    // editor end

    const fetchDataList = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/discussions/${discussion.id}/posts?skip=${skip}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                if (user && json.data && json.data.length > 0) {
                    const thumbRes = await fetch(`/api/user/effect/discussions/posts/thumbs?ids=${json.data.map(v => v.id).join(',')}`);
                    const thumbJson = await thumbRes.json();
                    json.data.forEach(post => post.viewer = { direction: thumbJson.data[post.id] });
                }
                setNewPosts(prev => prev.filter(newPost => !json.data.find(v => v.id === newPost.id)));
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
            {[...dataList, ...newPosts].map((post, index) => {
                return (
                    <Block key={index} display='flex' flexDirection='column' backgroundColor='backgroundSecondary' padding='scale600' overrides={{
                        Block: { style: { borderRadius: theme.borders.radius300 } }
                    }}>
                        <UserPanel id={post.user.id} name={post.user.name} avatar={post.user.avatar} title={post.user.title} gender={post.user.gender} />
                        <LabelSmall color='primary500' marginTop='scale600'>编辑于：{dayjs(post.updatedAt).format('YYYY 年 M 月 D 日 HH:mm')}</LabelSmall>
                        <LabelSmall color='primary500' marginTop='scale0'>IP：{post.ip || '神秘之地'}</LabelSmall>
                        <Block paddingTop='scale600' paddingBottom='scale600'>
                            {post.isEditing ? (
                                <DiscussionPostUpdater discussion={discussion} post={post}
                                    onCancelClick={() => {
                                        setNewPosts(prev => prev.map(v => v.id === post.id ? { ...v, isEditing: false } : v));
                                        setDataList(prev => prev.map(v => v.id === post.id ? { ...v, isEditing: false } : v));
                                    }}
                                    afterUpdate={({ content }) => {
                                        const now = dayjs().format('YYYY-MM-DDTHH:mm:ssZ');
                                        setNewPosts(prev => prev.map(v => v.id === post.id ? { ...v, content, updatedAt: now, isEditing: false } : v));
                                        setDataList(prev => prev.map(v => v.id === post.id ? { ...v, content, updatedAt: now, isEditing: false } : v));
                                    }}
                                />
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: post.content }} className='post'></div>
                            )}
                        </Block>
                        {!post.isEditing &&
                            <DiscussionPostActions discussion={discussion} post={post} isFirst={index === 0}
                                onQuoteClick={() => editor?.chain().focus().insertContent(`<blockquote>${post.content}</blockquote>`).run()}
                                onUpdateClick={() => {
                                    setNewPosts(prev => prev.map(v => v.id === post.id ? { ...v, isEditing: true } : v));
                                    setDataList(prev => prev.map(v => v.id === post.id ? { ...v, isEditing: true } : v));
                                }}
                                afterThumbed={({ direction }) => {
                                    setNewPosts(prev => prev.map(v => v.id === post.id ? { ...v, viewer: { ...v.viewer, direction } } : v));
                                    setDataList(prev => prev.map(v => v.id === post.id ? { ...v, viewer: { ...v.viewer, direction } } : v));
                                }}
                                afterDeleted={() => {
                                    setNewPosts(prev => prev.filter(v => v.id !== post.id));
                                    setDataList(prev => prev.filter(v => v.id !== post.id));
                                }}
                            />
                        }
                    </Block>
                );
            })}
            {isLoading && <Block display='flex' flexDirection='column' gridGap='scale300' justifyContent='center' marginBottom='scale600' marginTop='scale600'>
                <Skeleton animation height='220px' width='100%' />
                <Skeleton animation height='220px' width='100%' />
                <Skeleton animation height='220px' width='100%' />
            </Block>}
            {hasMore && !isLoading &&
                <Block marginTop='scale600' display='flex' justifyContent='center' alignItems='center'>
                    <Button onClick={() => setSkip(prev => prev + limit)} kind='tertiary' isLoading={isLoading} disabled={!hasMore}>查看更多</Button>
                </Block>
            }
            {user && !discussion?.isClosed &&
                <Block marginTop='scale600' display='flex' flexDirection='column' backgroundColor='backgroundSecondary' padding='scale600' overrides={{
                    Block: { style: { borderRadius: theme.borders.radius300 } }
                }}>
                    <LabelMedium marginBottom='scale600'>回复</LabelMedium>
                    <Block display='flex' marginBottom='scale600'>
                        <UserPanel id={user.id} name={user.name} avatar={user.avatar} title={user.title} gender={user.gender} />
                    </Block>
                    <Block display='flex' flexDirection='column'>
                        <Editor onCreate={({ editor }) => setEditor(editor)} onUpdate={({ editor }) => setCanSubmit(editor.getText().length > 0)} />
                        <Block marginTop='scale600' alignSelf='flex-end'>
                            <Button size='compact' disabled={!canSubmit} isLoading={isSubmitting} kind='secondary' onClick={() => handlePostSubmit()}>提交</Button>
                        </Block>
                    </Block>
                </Block>
            }
        </Block>
    );
}

function DiscussionsDetail() {
    const { appId, id } = useParams();
    const [css, theme] = useStyletron();
    const navigate = useNavigate();
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
                    } else {
                        throw { status: res.status };
                    }
                } catch (error) {
                    if (error?.status === 403) navigate('/login');
                    else if (error?.status === 404) navigate('/discussions', { replace: true });
                    else navigate('/not-work');
                } finally {
                    setIsLoadingDiscussion(false);
                }
            })();
        }
    }, [id, navigate]);

    return (
        <Block display='flex' flexDirection='column' width={LAYOUT_MAIN} marginTop='scale900' maxWidth='100%' overflow='hidden'
            overrides={{
                Block: {
                    style: {
                        [MOBILE_BREAKPOINT]: {
                            marginTop: theme.sizing.scale600, paddingLeft: theme.sizing.scale300, paddingRight: theme.sizing.scale300,
                        }
                    }
                }
            }}>
            <Block display='flex' width='100%' alignItems='center' gridGap='scale300' marginBottom='scale800'>
                <RouterLink href={`/discussions/apps/${discussion?.app?.id}`} kind='underline'><LabelSmall>{discussion?.app?.name}</LabelSmall></RouterLink> /
                <RouterLink href={`/discussions/apps/${discussion?.app?.id}/channels/${discussion?.channel?.id}`} kind='underline'><LabelSmall>{discussion?.channel?.name}</LabelSmall></RouterLink> /
                <LabelSmall>讨论详情</LabelSmall>
            </Block>
            <Block display='flex' width='100%' backgroundColor='backgroundSecondary' padding='scale700'
                marginBottom='scale600'
                overrides={{
                    Block: { style: { borderRadius: theme.borders.radius300, boxShadow: theme.lighting.shadow500, } }
                }}
            >
                <HeadingXSmall margin='0' maxWidth='100%'>
                    {discussion.isClosed && (<div className={css({ display: 'inline-flex', float: 'left', marginTop: theme.sizing.scale0, marginRight: theme.sizing.scale0, color: theme.colors.primary200 })}><Lock width='24px' height='24px' /></div>)}
                    {discussion.isSticky && (<div className={css({ display: 'inline-flex', float: 'left', marginTop: theme.sizing.scale0, marginRight: theme.sizing.scale100, color: theme.colors.primary200 })}><Pin width='24px' height='24px' /></div>)}
                    {discussion.title}
                </HeadingXSmall>
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
                    {!isLoadingDiscussion && <DiscussionMeta discussion={discussion} onChange={({ sticky, close, title }) => {
                        if (sticky !== undefined) setDiscussion(prev => ({ ...prev, isSticky: sticky }));
                        if (close !== undefined) setDiscussion(prev => ({ ...prev, isClosed: close }));
                        if (title !== undefined) setDiscussion(prev => ({ ...prev, title }));
                    }} />}
                    {!isLoadingDiscussion && <AppGlance app={discussion?.app} />}
                    {!isLoadingDiscussion && <OtherDiscussions appId={appId} discussionId={discussion.id} />}
                </Block>
            </Block>
        </Block>
    );
}

export default DiscussionsDetail;