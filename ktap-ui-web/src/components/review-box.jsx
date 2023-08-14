import React from 'react';
import Compressor from 'compressorjs';

import { Link, useNavigate } from 'react-router-dom';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { LabelLarge, LabelMedium, LabelSmall, LabelXSmall, ParagraphMedium, ParagraphSmall } from 'baseui/typography';
import { Textarea } from 'baseui/textarea';
import { Checkbox } from 'baseui/checkbox';
import { StatefulPopover } from 'baseui/popover';
import { StatefulMenu } from 'baseui/menu';
import { Input } from 'baseui/input';
import { ArrowUp } from 'baseui/icon';

import { useAuth } from '../hooks/use-auth';
import useScoreRemark from '../hooks/use-score-remark';
import { DateTime, IMAGE_UPLOAD_SIZE_LIMIT, MOBILE_BREAKPOINT, PAGE_LIMIT_NORMAL, Styles } from '../libs/utils';
import { ChevronRight, Gift, Hand, More, Photograph, Star, ThumbDown, ThumbUp, TrashBin } from './icons';
import ImageBoxGallery from './image-box-gallery';
import GiftType from './gift';
import RouterLink from './router-link';
import GenderLabel from './gender-label';
import AvatarSquare from './avatar-square';
import { StarRating } from 'baseui/rating';
import ImageBox from './image-box';
import LoadMore from './load-more';
import Buzzword from './buzzword';

// 头部
const Header = React.memo(function Header({ id, score = 0, }) {
    const [css, theme] = useStyletron();
    const { remark, color } = useScoreRemark({ score });

    return (
        <Link to={`/reviews/${id}`} className={css({
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: 'rgb(0 0 0) 2px 2px 2px', color: 'inherit',
            backgroundImage: `linear-gradient(to right, ${color}99, ${color}66)`,
            padding: theme.sizing.scale600, textDecoration: 'none',
            borderTopLeftRadius: theme.borders.radius300,
            borderTopRightRadius: theme.borders.radius300,
            ':hover': {
                backgroundColor: 'rgb(64, 64, 64)',
            },
        })}>
            <LabelMedium color='inherit' overrides={{
                Block: {
                    style: { fontWeight: 700, }
                }
            }}>
                {remark}
            </LabelMedium>
            <Block display='flex' alignItems='center'>
                <Block display='flex' alignItems='center'>
                    <LabelMedium color='inherit' marginLeft='scale0' marginRight='scale100'>{score}</LabelMedium>
                    <Star width={18} height={18} />
                </Block>
            </Block>
        </Link>
    );
});

// 发布时间，文本内容，图片内容
const Content = React.memo(function Content({ review, editable = false, afterUpdated }) {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isEditMode, setIsEditMode] = React.useState(false);
    const [draftReview, setDraftReview] = React.useState(null);
    const [isEditing, setIsEditing] = React.useState(false);
    const { remark } = useScoreRemark({ score: draftReview?.score });
    const draftReviewFileInput = React.useRef(null);
    const draftReviewFilesLimit = 3;

    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    const handleDeleteReview = async () => {
        if (!user) { navigate(`/login?from=${location.pathname}`); return; }
        try {
            const res = await fetch(`/api/reviews/${review.id}`, { method: 'DELETE' });
            if (res.ok) {
                if (review.app?.id) navigate(`/apps/${review.app.id}`, { replace: true });
                else location.reload;
            }
        } finally {
            setIsOpenDeleteConfirmModal(false);
        }
    };

    const openEditMode = async () => {
        setDraftReview({
            score: review.score,
            content: review.content,
            allowComment: review.allowComment,
            images: review.images,
            imagesToDelete: [],
            files: []
        });
        setIsEditMode(true);
    };

    const closeEditMode = async () => setIsEditMode(false);

    const handleUpdateReview = async () => {
        if (!user) { navigate(`/login?from=${location.pathname}`); return; }
        try {
            setIsEditing(true);
            const form = new FormData();
            for (const file of draftReview.files) {
                if (file.size > IMAGE_UPLOAD_SIZE_LIMIT) {
                    const compressedFile = await new Promise((resolve, reject) =>
                        new Compressor(file, {
                            quality: 0.7,
                            success(result) {
                                resolve(result);
                            },
                            error(err) {
                                reject(err);
                            }
                        })
                    );
                    form.append('file', compressedFile, compressedFile.name);
                } else {
                    form.append('file', file);
                }
            }
            form.append('score', draftReview.score);
            form.append('content', draftReview.content);
            form.append('allowComment', draftReview.allowComment);
            form.append('imagesToDelete', draftReview.imagesToDelete);
            const res = await fetch(`/api/reviews/${review.id}`, { method: 'PUT', body: form });
            if (res.ok) {
                setIsEditMode(false);
                afterUpdated();
            }
        } finally {
            setIsEditing(false);
        }
    };

    if (isEditMode) {
        return (<Block>
            <ParagraphSmall color='primary300' marginTop='scale300' marginBottom='scale600'>
                请注意保持礼貌并遵守 <RouterLink href='/rules' target='_blank' kind='underline'><b>规则手册</b></RouterLink>
            </ParagraphSmall>
            <Block display='flex' alignItems='center' paddingBottom='scale600'>
                <LabelMedium marginRight='scale600'>打分</LabelMedium>
                <Block marginTop='scale0' marginRight='scale600'>
                    <StarRating value={draftReview.score} onChange={({ value }) => setDraftReview(prev => { return { ...prev, score: value }; })} />
                </Block>
                <LabelSmall color='primary400'>{remark}</LabelSmall>
            </Block>
            <Block marginBottom='scale300'>
                <LabelXSmall color='primary400' marginBottom='scale300' marginRight='scale100' overrides={{ Block: { style: { textAlign: 'right' } } }}>{draftReview.content.length > 0 ? `${draftReview.content.length} / 8000` : ''}</LabelXSmall>
                <Textarea rows='5' maxLength='8000' value={draftReview.content} onChange={e => setDraftReview(prev => { return { ...prev, content: e.target.value }; })} />
            </Block>
            {/* 图片操作区域 */}
            {draftReview.images.length + draftReview.files.length > 0 && (
                <Block display='flex' alignItems='baseline' paddingLeft='scale100' paddingRight='scale100' paddingTop='scale300' paddingBottom='scale300'>
                    {draftReview.images.map((image, index) =>
                        <Block key={index} maxWidth='100px' marginRight='scale300'>
                            <ImageBox src={image.url} isDeletable onClickDelete={() =>
                                setDraftReview(prev => {
                                    return { ...prev, imagesToDelete: [...prev.imagesToDelete, image.id], images: prev.images.filter((_, i) => i !== index) };
                                })} />
                        </Block>
                    )}
                    {draftReview.files.map((file, index) => (
                        <Block key={index} maxWidth='100px' marginRight='scale300'>
                            <ImageBox src={file.src} isDeletable onClickDelete={() => setDraftReview(prev => {
                                return { ...prev, files: prev.files.filter((_, i) => i !== index) };
                            })} />
                        </Block>
                    ))}
                </Block>
            )}
            {/* 底部操作条 */}
            <Block display='flex' justifyContent='space-between'>
                <Block display='flex' alignItems='center' marginTop='0' marginBottom='0' marginRight='scale300'>
                    <Block display='flex' alignItems='center' paddingLeft='scale100' paddingRight='scale100'
                        onClick={() => draftReview.images.length + draftReview.files.length < draftReviewFilesLimit ? draftReviewFileInput.current.click() : null}
                        overrides={{
                            Block: {
                                style: ({ $theme }) => ({
                                    cursor: 'pointer',
                                    color: $theme.colors.primary100,
                                })
                            }
                        }}
                    >
                        <input type='file' accept='image/*' hidden multiple ref={draftReviewFileInput} onChange={(e) => {
                            const newFiles = [...e.target.files].map(file => {
                                file.src = URL.createObjectURL(file);
                                return file;
                            });
                            const seats = draftReviewFilesLimit - draftReview.images.length + draftReview.files.length;
                            setDraftReview(prev => {
                                return { ...prev, files: [...prev.files, ...newFiles].slice(0, seats) };
                            });
                        }} />
                        <Photograph width={20} height={20} />
                        <LabelSmall color='inherit' marginLeft='scale0'>
                            <LabelSmall overrides={{
                                Block: {
                                    style: {
                                        [MOBILE_BREAKPOINT]: { display: 'none' }
                                    }
                                }
                            }}>配图({draftReview.images.length + draftReview.files.length}/{draftReviewFilesLimit})</LabelSmall>
                        </LabelSmall>
                    </Block>
                </Block>
                <Block display='flex' alignItems='center'>
                    <Block marginTop='0' marginBottom='0' marginRight='scale300'>
                        <Checkbox labelPlacement='right'
                            checked={draftReview.allowComment}
                            onChange={e => setDraftReview(prev => { return { ...prev, allowComment: e.target.checked } })}
                            overrides={{
                                Root: {
                                    style: ({ $theme }) => ({
                                        paddingLeft: $theme.sizing.scale500, paddingRight: $theme.sizing.scale500,
                                        paddingTop: $theme.sizing.scale400, paddingBottom: $theme.sizing.scale400,
                                    })
                                },
                                Checkmark: {
                                    style: ({ $theme }) => ({
                                        width: $theme.sizing.scale600, height: $theme.sizing.scale600,
                                    })
                                },
                                Label: {
                                    style: ({ $theme }) => ({
                                        fontSize: $theme.sizing.scale550, paddingLeft: $theme.sizing.scale100,
                                        lineHeight: $theme.sizing.scale700, color: $theme.colors.primary100,
                                    })
                                }
                            }}>
                            允许回复
                        </Checkbox>
                    </Block>
                    <Block display='grid' gridGap='scale100' gridAutoFlow='column'>
                        <Button kind='tertiary' size='compact'
                            onClick={() => closeEditMode()}
                            disabled={isEditing}
                            overrides={{
                                BaseButton: {
                                    style: ({ $theme }) => ({
                                        paddingLeft: $theme.sizing.scale700,
                                        paddingRight: $theme.sizing.scale700,
                                    })
                                }
                            }}>
                            取消
                        </Button>
                        <Button kind='secondary' size='compact'
                            onClick={() => handleUpdateReview()}
                            isLoading={isEditing}
                            disabled={draftReview?.content?.length < 1}
                            overrides={{
                                BaseButton: {
                                    style: ({ $theme }) => ({
                                        paddingLeft: $theme.sizing.scale700,
                                        paddingRight: $theme.sizing.scale700,
                                    })
                                }
                            }}>
                            更新
                        </Button>
                    </Block>
                </Block>
            </Block>
        </Block>);
    }

    return (
        <Block display='flex' flexDirection='column'>
            <Block display='flex' justifyContent='space-between' alignItems='center' minHeight='28px'>
                <LabelSmall color='primary500'>发布于：{DateTime.formatCN(review.updatedAt)}</LabelSmall>
                {editable && user?.id === review.user?.id &&
                    <Block>
                        <StatefulPopover focusLock placement='bottomRight'
                            content={({ close }) => (
                                <StatefulMenu
                                    items={[{ label: '编辑' }, { label: '删除' },]}
                                    onItemSelect={({ item }) => {
                                        switch (item.label) {
                                            case '编辑': openEditMode(); break;
                                            case '删除': setIsOpenDeleteConfirmModal(true); break;
                                            default: break;
                                        }
                                        close();
                                    }}
                                />
                            )}
                        >
                            <Button kind='tertiary' size='mini' shape='circle'><More width='16px' height='16px' color='#a3a3a3' /></Button>
                        </StatefulPopover>
                        <Modal onClose={() => setIsOpenDeleteConfirmModal(false)}
                            closeable={false}
                            isOpen={isOpenDeleteConfirmModal}
                            animate
                            autoFocus
                            role={ROLE.alertdialog}
                        >
                            <ModalHeader>是否删除评测？</ModalHeader>
                            <ModalBody>您确定要删除这篇评测吗？该操作<b>不能撤消</b>。</ModalBody>
                            <ModalFooter>
                                <ModalButton kind='tertiary' onClick={() => setIsOpenDeleteConfirmModal(false)}>取消</ModalButton>
                                <ModalButton onClick={() => handleDeleteReview()}>确定</ModalButton>
                            </ModalFooter>
                        </Modal>
                    </Block>
                }
            </Block>
            <ParagraphMedium dangerouslySetInnerHTML={{ __html: review.content.replace(/\r\n/g, '<br>') }}></ParagraphMedium>
            <Block display='flex' alignItems='baseline'>
                <ImageBoxGallery id={`list-ibg-${review.id}`} images={review.images} />
            </Block>
        </Block>
    );
});

// 操作按钮：举报
const ActionReport = function ({ reviewId, reviewUserId, initIsReported = true }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [reportContent, setReportContent] = React.useState('');
    const [isOpenReportModal, setIsOpenReportModal] = React.useState(false);
    const [isReporting, setIsReporting] = React.useState(false);
    const [reportErr, setReportErr] = React.useState(null);
    const [isReported, setIsReported] = React.useState(initIsReported);

    const handleReport = async () => {
        if (!user) { navigate(`/login?from=${location.pathname}`); return; }
        setIsReporting(true);
        setReportErr(null);
        try {
            const res = await fetch(`/api/reviews/${reviewId}/report`, {
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

    if (!user || isReported || user.id === reviewUserId) return null;

    return (
        <Block>
            <Button title='举报' onClick={() => { setIsOpenReportModal(true); setReportContent(''); setReportErr(null); }} kind='secondary' size='mini' overrides={Styles.Button.Act}>
                <Hand width={16} height={16} />
            </Button>
            <Modal onClose={() => setIsOpenReportModal(false)} closeable={false} isOpen={isOpenReportModal} animate autoFocus role={ROLE.alertdialog}>
                <ModalHeader>举报评测</ModalHeader>
                <ModalBody>
                    <LabelSmall marginBottom='scale600'>请输入您举报该评测的理由，如果理由不够充分，该操作无效。举报操作无法撤消。</LabelSmall>
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
        </Block>
    );
}

// 操作按钮
const Actions = function ({ review, actions }) {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [isDoingThumbUp, setIsDoingThumbUp] = React.useState(false);
    const [isDoingThumbDown, setIsDoingThumbDown] = React.useState(false);
    const [isActiveThumbUp, setIsActiveThumbUp] = React.useState(review.viewer?.direction === 'up');
    const [isActiveThumbDown, setIsActiveThumbDown] = React.useState(review.viewer?.direction === 'down');
    const [isOpenGiftModal, setIsOpenGiftModal] = React.useState(false);
    const [gifts, setGifts] = React.useState([]);
    const [checkedGift, setCheckedGift] = React.useState(null);
    const [isOpenGiftConfirmModal, setIsOpenGiftConfirmModal] = React.useState(false);
    const [isSendingGift, setIsSendingGift] = React.useState(false);

    const handleThumb = async (direction) => {
        if (!user) { navigate(`/login?from=${location.pathname}`); return; }
        direction === 'up' && setIsDoingThumbUp(true);
        direction === 'down' && setIsDoingThumbDown(true);
        try {
            const res = await fetch(`/api/reviews/${review.id}/thumb/${direction}`, { method: 'POST' });
            if (res.ok) {
                const json = await res.json();
                review.meta.ups = json.data?.ups;
                review.meta.downs = json.data?.downs;

                direction === 'up' && (setIsActiveThumbDown(false) || setIsActiveThumbUp(prev => !prev));
                direction === 'down' && (setIsActiveThumbUp(false) || setIsActiveThumbDown(prev => !prev));
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
            const res = await fetch(`/api/reviews/${review.id}/gifts/${checkedGift.id}`, { method: 'POST' });
            if (res.ok) {
                const json = await res.json();
                setUser({ ...user, balance: user.balance - checkedGift.price });
                review.meta.gifts = json.count;
                review.gifts = json.data;
                setIsOpenGiftConfirmModal(false);
            }
        } finally {
            setIsSendingGift(false);
        }
    };

    return (
        <Block display='flex' flexDirection='column'>
            <LabelSmall color='primary400'>这篇评测你这么看？</LabelSmall>
            <Block display='flex' paddingTop='scale400' paddingBottom='scale300' justifyContent='space-between' alignItems='center'>
                <Block display='grid' gridGap='scale100' gridAutoFlow='column'>
                    <Button kind='secondary' size='mini' onClick={() => handleThumb('up')}
                        startEnhancer={() => <ThumbUp width={16} height={16} />}
                        overrides={Styles.Button.Act}
                        isSelected={isActiveThumbUp}
                        isLoading={isDoingThumbUp}
                    >
                        赞 {review.meta.ups}
                    </Button>
                    <Button kind='secondary' size='mini' onClick={() => handleThumb('down')}
                        startEnhancer={() => <ThumbDown width={16} height={16} />}
                        overrides={Styles.Button.Act}
                        isSelected={isActiveThumbDown}
                        isLoading={isDoingThumbDown}
                    >
                        踩 {review.meta.downs}
                    </Button>
                    <Button kind='secondary' size='mini' onClick={() => handleGift()}
                        startEnhancer={() => <Gift width={16} height={16} />}
                        overrides={Styles.Button.Act}
                    >
                        赏 {review.meta.gifts}
                    </Button>
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
                                        <LabelXSmall marginTop='scale300' color='primary200'>{gift.description}</LabelXSmall>
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
                </Block>
                {actions?.report && <ActionReport reviewId={review.id} reviewUserId={review.user.id} initIsReported={review.viewer?.reported} />}
            </Block>
            {review.meta.gifts > 0 && review.gifts &&
                <>
                    <LabelSmall color='primary400' marginTop='scale300' marginBottom='scale300'>收到的礼物：</LabelSmall>
                    <Block display='grid' gridGap='scale100' gridAutoFlow='column' width='min-content'>
                        {review?.gifts.map((gift, index) =>
                            <GiftType key={index} src={gift.url} name={gift.name} number={gift.count} description={gift.description} price={gift.price} />)
                        }
                    </Block>
                </>
            }
        </Block>
    );
};

// 游戏部分
const AppInfo = React.memo(function AppInfo({ app }) {
    return (
        <Block display='flex' alignItems='center' backgroundColor='backgroundTertiary' padding='scale300' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    borderRadius: $theme.borders.radius300,
                })
            }
        }}>
            {app ?
                <>
                    <Block display='flex' maxWidth='196px'>
                        <img width='100%' height='auto' src={app?.media?.head?.thumbnail} />
                    </Block>
                    <Block paddingLeft='scale400' display='flex' flexDirection='column'>
                        <RouterLink href={`/apps/${app?.id}`} kind='underline'>
                            <LabelMedium marginBottom='scale100' overrides={{
                                Block: {
                                    style: {
                                        inlineSize: '168px',
                                        whiteSpace: 'break-spaces',
                                    }
                                }
                            }}>{app?.name}</LabelMedium>
                        </RouterLink>
                        <Block display='flex' alignItems='center' justifyContent='flex-start'>
                            <Block marginRight='scale0' font='font300'>{app?.score}</Block>
                            <Star width='20px' height='20px' />
                        </Block>
                    </Block>
                </>
                :
                (<LabelMedium color='primary400'>该游戏暂不可见</LabelMedium>)
            }
        </Block>
    );
});

// 用户部分
const User = React.memo(function User({ user }) {
    if (!user) return null;
    return (
        <Block display='flex' justifyContent='flex-start' alignItems='center'>
            <AvatarSquare size='scale1000' src={user.avatar} />
            <Block marginLeft='scale300' flex={1} display='flex' alignItems='center'>
                <Block display='flex' flexDirection='column'>
                    <Block display='flex' alignItems='center' marginBottom='scale100'>
                        <LabelMedium marginRight='scale100'><RouterLink href={`/users/${user.id}`}>{user.name}</RouterLink></LabelMedium>
                        <GenderLabel gender={user.gender} />
                    </Block>
                    <LabelXSmall color='primary100' marginRight='scale100'>{user.title}</LabelXSmall>
                </Block>
            </Block>
        </Block>
    );
});

// 回复概览
const CommentsSummary = React.memo(function CommentsSummary({ id, comments, count }) {
    const navigate = useNavigate();
    if (!comments || comments.length === 0) return null;
    return (
        <Block display='flex' flexDirection='column' gridGap='scale300'>
            <Block display='flex'>
                <LabelSmall color='primary100' overrides={{
                    Block: {
                        style: {
                            fontWeight: 'bold',
                        }
                    }
                }}>{comments[0].user.name}：</LabelSmall>
                <LabelSmall color='primary300'>{comments[0].content}</LabelSmall>
            </Block>
            {/* 如果有2条以上才显示 */}
            {count > 1 && (
                <Block display='flex'>
                    <LabelSmall
                        onClick={() => navigate(`/reviews/${id}`)}
                        color='primary100'
                        overrides={{
                            Block: {
                                style: {
                                    cursor: 'pointer',
                                }
                            }
                        }}>全部 {count} 条回复</LabelSmall>
                    <ChevronRight width={16} height={16} />
                </Block>
            )}
        </Block>
    );
});

const Buzzwords = React.memo(function Buzzwords({ onClick = () => { } }) {
    const [buzzwords, setBuzzwords] = React.useState([]);
    React.useEffect(() => {
        (async () => {
            const res = await fetch('/api/buzzwords?limit=15');
            if (res.ok) {
                const json = await res.json();
                setBuzzwords(json.data);
            }
        })();
    }, []);
    return (
        <Block display='flex' flexWrap='wrap' alignItems='center'>
            {buzzwords?.map(({ content }, index) => <Buzzword key={index} onClick={() => onClick({ content })}>{content}</Buzzword>)}
        </Block>
    );
});

const CommentsInput = function ({ reviewId, allowComment, afterSubmit = () => { } }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [commentContent, setCommentContent] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitErrorMessage, setSubmitErrorMessage] = React.useState(null);

    const handleSubmitComment = async () => {
        if (!user) { navigate(`/login?from=${location.pathname}`); return; }
        if (commentContent && commentContent.length > 0) {
            try {
                setSubmitErrorMessage(null);
                setIsSubmitting(true);
                const res = await fetch(`/api/reviews/${reviewId}/comments`,
                    {
                        method: 'POST', headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ content: commentContent }),
                    });
                if (res.ok) {
                    const json = await res.json();
                    setCommentContent('');
                    json.data.user = user;
                    afterSubmit({ comment: json.data });
                }
            } catch {
                setSubmitErrorMessage('抱歉，发生了某种错误，请稍后再试。');
            } finally {
                setIsSubmitting(false);
            }
        }
    };
    return (
        <>
            <Block display='flex' alignItems='center'>
                <Block marginRight='scale300'>
                    <AvatarSquare size='scale1000' src={user.avatar} />
                </Block>
                <Block flex={1}>
                    <Input maxLength='1000' disabled={isSubmitting || !allowComment} value={commentContent} onChange={e => setCommentContent(e.target.value)}
                        placeholder={allowComment ? '添加回复' : '该评测已关闭回复'}
                        endEnhancer={() =>
                            commentContent &&
                            <Block marginRight='-8px'>
                                <Button onClick={() => handleSubmitComment()} disabled={!commentContent || isSubmitting || !allowComment} kind='primary' shape='circle' size='mini'>
                                    <ArrowUp size={16} />
                                </Button>
                            </Block>}
                    />
                </Block>
            </Block>
            {submitErrorMessage && <Block display='flex' alignItems='center' justifyContent='flex-end'>
                <LabelSmall marginRight='scale300' color='negative'>{submitErrorMessage}</LabelSmall>
            </Block>}
            {allowComment && <Buzzwords onClick={({ content }) => setCommentContent(content)} />}
        </>
    );
};

// 回复列表
const CommentsList = function ({ reviewId, commentsCount, allowComment }) {
    const limit = PAGE_LIMIT_NORMAL;
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = React.useState(true);
    const [comments, setComments] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const [count, setCount] = React.useState(commentsCount);

    const handleDeleteComment = async (comment) => {
        if (!user) { navigate(`/login?from=${location.pathname}`); return; }
        if (comment && comment.id) {
            const res = await fetch(`/api/reviews/${reviewId}/comments/${comment.id}`, { method: "DELETE" });
            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== comment.id));
                setCount(prev => prev - 1);
            }
        }
    };

    React.useEffect(() => {
        (async () => {
            if (!reviewId) return;
            try {
                setIsLoading(true);
                const res = await fetch(`/api/reviews/${reviewId}/comments?skip=${skip}&limit=${limit}`);
                if (res.ok) {
                    const json = await res.json();
                    setComments(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                    setHasMore(json.skip + limit < json.count);
                    setCount(json.count);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [reviewId, skip, limit]);

    return (
        <Block display='flex' flexDirection='column' gridGap='scale400'>
            <CommentsInput reviewId={reviewId} allowComment={allowComment} afterSubmit={({ comment }) => {
                setComments(prev => [comment, ...prev]);
                setCount(prev => prev + 1);
            }} />
            <Separator />
            <LabelMedium color='primary100'>回复 ({count})</LabelMedium>
            <Block display='flex' flexDirection='column' marginBottom='scale300' gridGap='scale300'>
                {comments?.map((comment, index) => (
                    <Block key={index} display='flex' alignItems='center'>
                        <Block marginRight='scale300' alignSelf='flex-start'>
                            <AvatarSquare size='scale1000' src={comment.user.avatar} />
                        </Block>
                        <Block display='flex' flex='1' flexDirection='column'>
                            <Block display='flex'>
                                <LabelSmall marginRight='scale300' overrides={{
                                    Block: {
                                        style: {
                                            fontWeight: 'bold',
                                        }
                                    }
                                }}>
                                    <RouterLink href={`/users/${comment.user.id}`}>{comment.user.name}</RouterLink>
                                </LabelSmall>
                                <LabelXSmall color='primary400'>{DateTime.fromNow(comment.createdAt)}</LabelXSmall>
                            </Block>
                            <ParagraphSmall marginTop='scale200' marginBottom='0' color='primary100'>{comment.content}</ParagraphSmall>
                        </Block>
                        {user?.id === comment.user.id &&
                            <Button kind='tertiary' size='mini' shape='circle' onClick={() => handleDeleteComment(comment)}>
                                <TrashBin width='16px' height='16px' color='#a3a3a3' />
                            </Button>
                        }
                    </Block>
                ))}
            </Block>
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='58px' onClick={() => setSkip(prev => prev + limit)} />
        </Block>
    );
};

const Separator = React.memo(function Separator() {
    const [css, theme] = useStyletron();
    return (
        <div className={css({ width: '100%', height: '1px', backgroundColor: theme.borders.border200.borderColor })} />
    );
});

/**
 * 主要用于三个地方：
 * 用户中心的 评测 标签页 /users/[id]
 * 游戏页面的 评测 标签页 /apps/[id]
 * 评测的详细页面 /reviews/[id]
 *
 * 参数:
 * include: {
 *     header: boolean, // 是否展示header
 *     app: boolean, // 是否展示app信息
 *     user: boolean, // 是否展示用户信息,
 *     comments: {
 *         summary: boolean, // 是否展示回复概览 ,
 *         list: boolean, // 是否展示回复操作框和回复列表
 *     },
 *     actions: {
 *         report: boolean, // 是否展示举报按钮
 *     }
 * },
 * editable: boolean, // 是否可以编辑（更新或者删除）
 * afterUpdated: () => {}, // 更新完成后（多用于上层 UI 更新数据）
 */
const ReviewBox = function ({ review, include = {}, editable, afterUpdated = () => { } }) {
    if (!review) return null;
    return (
        <Block display='flex' flexDirection='column' marginBottom='scale600' backgroundColor='backgroundSecondary'
            overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        borderBottomLeftRadius: $theme.borders.radius300,
                        borderBottomRightRadius: $theme.borders.radius300,
                        [MOBILE_BREAKPOINT]: {
                            borderTopLeftRadius: $theme.borders.radius300,
                            borderTopRightRadius: $theme.borders.radius300,
                        }
                    })
                }
            }}
        >
            {include.header && <Header id={review.id} score={review.score} />}
            <Block padding='scale600' display='flex' flexDirection='column' gridGap='scale400'>
                {include.app && <AppInfo app={review.app} />}
                {include.user && <User user={review.user} />}
                <Content review={review} editable={editable} afterUpdated={afterUpdated} />
                <Separator />
                <Actions review={review} actions={{ report: include.actions?.report || false }} />
                {include.comments?.summary && review.meta.comments > 0 && <><Separator /><CommentsSummary id={review.id} comments={review.comments} count={review.meta.comments} /></>}
                {include.comments?.list && <><Separator /><CommentsList reviewId={review.id} reviewCount={review.meta.comments} allowComment={review.allowComment} /></>}
            </Block>
        </Block>
    );
}

export default ReviewBox;






