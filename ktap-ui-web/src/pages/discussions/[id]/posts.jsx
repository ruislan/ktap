import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Textarea } from 'baseui/textarea';
import { LabelLarge, LabelMedium, LabelSmall, LabelXSmall, ParagraphSmall } from 'baseui/typography';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, ROLE } from 'baseui/modal';

import Editor from '@ktap/components/editor';
import LoadMore from '@ktap/components/load-more';
import { useAuth } from '@ktap/hooks/use-auth';
import { DateTime, PAGE_LIMIT_NORMAL, Styles } from '@ktap/libs/utils';
import { Hand, Quote, ThumbDown, Gift, ThumbUp, TrashBin, Update as UpdateIcon } from '@ktap/components/icons';
import GiftType from '@ktap/components/gift';
import Notification from '@ktap/components/notification';
import AvatarSquare from '@ktap/components/avatar-square';
import RouterLink from '@ktap/components/router-link';
import GenderLabel from '@ktap/components/gender-label';
import '@ktap/assets/css/post.css';

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

function PostActions({ discussion, post, isFirst = false, onQuoteClick = () => { }, afterThumbed = () => { }, afterDeleted = () => { }, onUpdateClick = () => { } }) {
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
    const [reportErr, setReportErr] = React.useState(null);
    // end report
    // delete post
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    // end delete post

    const [operations, setOperations] = React.useState({ update: false, delete: false });

    const handleThumb = async (direction) => {
        if (!user) { navigate(`/login?from=${location.pathname}`); return; }
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
        if (!user) { navigate(`/login?from=${location.pathname}`); return; }
        setIsOpenGiftModal(true);
        setCheckedGift(null);
        const giftsRes = await fetch(`/api/gifts`);
        if (giftsRes.ok) {
            const json = await giftsRes.json();
            setGifts(json.data);
        }
    };

    const handleSendGift = async () => {
        if (!user) { navigate(`/login?from=${location.pathname}`); return; }
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
        if (!user) { navigate(`/login?from=${location.pathname}`); return; }
        setIsReporting(true);
        setReportErr(null);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}/posts/${post.id}/report`, {
                method: 'POST',
                body: JSON.stringify({ content: reportContent }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setIsReported(true);
                setIsOpenReportModal(false);
            } else {
                if (res.status === 400) {
                    const json = await res.json();
                    setReportErr(json.message);
                }
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
                            <Button kind='secondary' size='mini' onClick={() => { setIsOpenReportModal(true); setReportContent(''); setReportErr(null); }} overrides={Styles.Button.Act} title='举报'><Hand width={16} height={16} /></Button>
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
            <Modal onClose={() => setIsOpenReportModal(false)} closeable={false} isOpen={isOpenReportModal} animate autoFocus role={ROLE.alertdialog}>
                <ModalHeader>举报评测</ModalHeader>
                <ModalBody>
                    <LabelSmall marginBottom='scale600'>请输入您举报该帖子的理由，如果理由不够充分，该操作无效。举报操作无法撤消。</LabelSmall>
                    {reportErr && <Notification kind='negative' message={reportErr} />}
                    <LabelXSmall color='primary400' marginBottom='scale300' overrides={{ Block: { style: { textAlign: 'right' } } }}>{reportContent.length > 0 ? `${reportContent.length} / 150` : ''}</LabelXSmall>
                    <Textarea readOnly={isReporting} placeholder='请注意文明用语，否则视为无效举报'
                        rows='3' maxLength='150' value={reportContent} onChange={(e) => setReportContent(e.target.value)} />
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenReportModal(false)}>取消</ModalButton>
                    <Button kind='primary' isLoading={isReporting} onClick={() => handleReport()}>确定</Button>
                </ModalFooter>
            </Modal>
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


function PostUpdater({ discussion, post, afterUpdate = () => { }, onCancelClick = () => { } }) {
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
export default function Posts({ discussion }) {
    const limit = PAGE_LIMIT_NORMAL;
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
            if (error?.status === 401 || error?.status === 403) navigate(`/login?from=${location.pathname}`);
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
    }, [discussion.id, skip, limit, user]);

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
                        <LabelSmall color='primary500' marginTop='scale600'>编辑于：{DateTime.formatCN(post.updatedAt)}</LabelSmall>
                        <LabelSmall color='primary500' marginTop='scale0'>IP：{post.ip || '神秘之地'}</LabelSmall>
                        <Block paddingTop='scale600' paddingBottom='scale600'>
                            {post.isEditing ? (
                                <PostUpdater discussion={discussion} post={post}
                                    onCancelClick={() => {
                                        setNewPosts(prev => prev.map(v => v.id === post.id ? { ...v, isEditing: false } : v));
                                        setDataList(prev => prev.map(v => v.id === post.id ? { ...v, isEditing: false } : v));
                                    }}
                                    afterUpdate={({ content }) => {
                                        const now = new Date().toISOString();
                                        setNewPosts(prev => prev.map(v => v.id === post.id ? { ...v, content, updatedAt: now, isEditing: false } : v));
                                        setDataList(prev => prev.map(v => v.id === post.id ? { ...v, content, updatedAt: now, isEditing: false } : v));
                                    }}
                                />
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: post.content }} className='post'></div>
                            )}
                        </Block>
                        {!post.isEditing &&
                            <PostActions discussion={discussion} post={post} isFirst={index === 0}
                                onQuoteClick={() => {
                                    if (!user) { navigate(`/login?from=${location.pathname}`); return; }
                                    editor?.chain().focus().insertContent(`<blockquote>${post.content}</blockquote>`).run();
                                }}
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
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='220px' onClick={() => setSkip(prev => prev + limit)} />
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