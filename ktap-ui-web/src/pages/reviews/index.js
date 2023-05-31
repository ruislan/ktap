import React from 'react';
import dayjs from 'dayjs';
import Compressor from 'compressorjs';

import { useNavigate, useParams } from 'react-router-dom';
import { Block } from 'baseui/block';
import { StatefulPopover, PLACEMENT } from 'baseui/popover';
import { StatefulMenu } from 'baseui/menu';
import { StarRating } from 'baseui/rating';
import { Button } from 'baseui/button';
import { Textarea } from 'baseui/textarea';
import { Checkbox } from 'baseui/checkbox';
import { LabelSmall, LabelXSmall, LabelLarge, LabelMedium, ParagraphMedium, ParagraphSmall } from 'baseui/typography';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, ROLE } from 'baseui/modal';
import { ThumbUp, ThumbDown, Gift, Hand, More, Photograph } from '../../components/icons';
import { MOBILE_BREAKPOINT, LAYOUT_LEFT, LAYOUT_RIGHT, Styles, IMAGE_UPLOAD_SIZE_LIMIT } from '../../constants';

import ReviewAppGlance from './review-app-glance';
import ReviewComments from './review-comments';
import ReviewTopBar from './review-top-bar';
import GiftType from '../../components/gift';
import ImageBox from '../../components/image-box';
import ImageBoxGallery from '../../components/image-box-gallery';

import { useAuth } from '../../hooks/use-auth';
import useScoreRemark from '../../hooks/use-score-remark';
import RouterLink from '../../components/router-link';

function Review() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [review, setReview] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    const [isDoingThumbUp, setIsDoingThumbUp] = React.useState(false);
    const [isDoingThumbDown, setIsDoingThumbDown] = React.useState(false);
    const [isActiveThumbUp, setIsActiveThumbUp] = React.useState(false);
    const [isActiveThumbDown, setIsActiveThumbDown] = React.useState(false);
    const [isOpenGiftModal, setIsOpenGiftModal] = React.useState(false);
    const [gifts, setGifts] = React.useState([]);
    const [checkedGift, setCheckedGift] = React.useState(null);
    const [isOpenGiftConfirmModal, setIsOpenGiftConfirmModal] = React.useState(false);
    const [isSendingGift, setIsSendingGift] = React.useState(false);
    const [reportContent, setReportContent] = React.useState('');
    const [isOpenReportModal, setIsOpenReportModal] = React.useState(false);
    const [isReporting, setIsReporting] = React.useState(false);
    const [isReported, setIsReported] = React.useState(true);
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [draftReview, setDraftReview] = React.useState(null);
    const [isEditing, setIsEditing] = React.useState(false);
    const { remark } = useScoreRemark({ score: draftReview?.score });
    const draftReviewFileInput = React.useRef(null);
    const draftReviewFilesLimit = 3;

    const fetchReview = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/reviews/${id}`);
            if (res.ok) {
                const json = await res.json();
                setReview(json.data);
            } else {
                if (res.status === 404) navigate('/not-found', { replace: true });
                if (res.status >= 500) navigate('/panic');
            }
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    React.useEffect(() => {
        fetchReview();
    }, [fetchReview]);

    // 加载本页面的时候，查询用户对于这个review的交互情况
    // 已经点赞或者点踩的情况要给予初始值，已经举报的不显示举报
    React.useEffect(() => {
        (async () => {
            if (user) {
                const res = await fetch(`/api/user/effect/reviews/${id}`);
                if (res.ok) {
                    const json = await res.json();
                    json.data?.thumb === 'up' && setIsActiveThumbUp(true);
                    json.data?.thumb === 'down' && setIsActiveThumbDown(true);
                    setIsReported(json.data.reported || false);
                }
            }
        })();
    }, [user, id]);

    const handleDeleteReview = async () => {
        if (!user) { navigate('/login'); return; }
        try {
            const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
            if (res.ok) {
                navigate(`/apps/${review.app.id}`, { replace: true });
            }
        } finally {
            setIsOpenDeleteConfirmModal(false);
        }
    };

    const handleThumb = async (direction) => {
        if (!user) { navigate('/login'); return; }
        direction === 'up' && setIsDoingThumbUp(true);
        direction === 'down' && setIsDoingThumbDown(true);
        try {
            const res = await fetch(`/api/reviews/${id}/thumb/${direction}`, { method: 'POST' });
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
            const res = await fetch(`/api/reviews/${review.id}/gifts/${checkedGift.id}`, { method: 'POST' });
            if (res.ok) {
                const json = await res.json();
                user.balance = user.balance - checkedGift.price;
                review.meta.gifts = json.count;
                review.gifts = json.data;
                setIsOpenGiftConfirmModal(false);
            }
        } finally {
            setIsSendingGift(false);
        }
    };

    const handleReport = async () => {
        if (!user) { navigate('/login'); return; }
        setIsReporting(true);
        try {
            const res = await fetch(`/api/reviews/${review.id}/report`, {
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

    const closeEditMode = async () => {
        setIsEditMode(false);
    };

    const handleUpdateReview = async () => {
        if (!user) { navigate('/login'); return; }
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
            const res = await fetch(`/api/reviews/${id}`, { method: 'PUT', body: form });
            if (res.ok) {
                setIsEditMode(false);
                fetchReview();
            }
        } finally {
            setIsEditing(false);
        }
    };
    return (
        <>
            {!isLoading &&
                <Block marginTop='scale900' overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            [MOBILE_BREAKPOINT]: {
                                marginTop: $theme.sizing.scale600,
                                width: '100%',
                            }
                        })
                    }
                }}>
                    <ReviewTopBar review={review} />

                    <Block paddingLeft='scale300' paddingRight='scale300' paddingTop='scale100'>
                        <Block overrides={{
                            Block: {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    [MOBILE_BREAKPOINT]: {
                                        display: 'grid'
                                    },
                                }
                            }
                        }}>
                            <Block width={LAYOUT_LEFT} marginRight='scale300' overrides={{
                                Block: {
                                    style: {
                                        [MOBILE_BREAKPOINT]: {
                                            width: '100%',
                                            paddingLeft: 0,
                                            paddingRight: 0,
                                            margin: '0',
                                            gridArea: '2 / 1',
                                        }
                                    }
                                }
                            }} >
                                <Block backgroundColor='backgroundSecondary' paddingLeft='scale600' paddingRight='scale600' paddingBottom='scale600'
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
                                    {/* 内容 */}
                                    {isEditMode ?
                                        <Block paddingTop='scale300' paddingBottom='scale300'>
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
                                                <Textarea rows='5' maxLength='5000' value={draftReview.content} onChange={e => setDraftReview(prev => { return { ...prev, content: e.target.value }; })} />
                                            </Block>
                                            {/* 图片操作区域 */}
                                            {draftReview.images.length + draftReview.files.length > 0 && (
                                                <Block display='flex' alignItems='baseline' paddingLeft='scale100' paddingRight='scale100' paddingTop='scale300' paddingBottom='scale300'>
                                                    {/* 先显示images */}
                                                    {draftReview.images.map((image, index) =>
                                                        <Block key={index} maxWidth='100px' marginRight='scale300'>
                                                            <ImageBox src={image.url} isDeletable onClickDelete={() =>
                                                                setDraftReview(prev => {
                                                                    return { ...prev, imagesToDelete: [...prev.imagesToDelete, image.id], images: prev.images.filter((_, i) => i !== index) };
                                                                })} />
                                                        </Block>
                                                    )}
                                                    {/* 再显示files */}
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
                                                                        paddingLeft: $theme.sizing.scale500,
                                                                        paddingRight: $theme.sizing.scale500,
                                                                        paddingTop: $theme.sizing.scale400,
                                                                        paddingBottom: $theme.sizing.scale400,
                                                                    })
                                                                },
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
                                        </Block> :
                                        <Block paddingTop='scale300' paddingBottom='scale300'>
                                            <Block display='flex' justifyContent='space-between' alignItems='center' marginTop='scale100' minHeight='28px'>
                                                <LabelSmall color='primary500'>发布于：{dayjs(review.updatedAt).format('YYYY 年 M 月 D 日')}</LabelSmall>
                                                {user?.id === review?.user?.id &&
                                                    <Block>
                                                        <StatefulPopover
                                                            focusLock
                                                            placement={PLACEMENT.bottomRight}
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
                                            <Block paddingBottom='scale300'>
                                                <ImageBoxGallery id='galleryView' images={review.images} />
                                            </Block>
                                        </Block>
                                    }
                                    {/* 这里展示交互操作：赞，踩，赏，举报等…… */}
                                    <Block paddingTop='scale300' paddingBottom='scale300' overrides={{
                                        Block: {
                                            style: ({ $theme }) => ({
                                                borderStyle: 'solid',
                                                borderColor: $theme.borders.border200.borderColor,
                                                borderTopWidth: '1px',
                                                borderBottomWidth: '1px',
                                                borderLeftWidth: '0',
                                                borderRightWidth: '0',
                                            })
                                        }
                                    }}>
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
                                            </Block>
                                            {user && !isReported && user.id !== review.user?.id &&
                                                <Block>
                                                    <Button
                                                        onClick={() => { setIsOpenReportModal(true); setReportContent(''); }}
                                                        startEnhancer={() => <Hand width={16} height={16} />}
                                                        kind='secondary'
                                                        size='mini'
                                                        overrides={Styles.Button.Act}
                                                    >
                                                        举报
                                                    </Button>
                                                    <Modal onClose={() => setIsOpenReportModal(false)}
                                                        closeable={false}
                                                        isOpen={isOpenReportModal}
                                                        animate
                                                        autoFocus
                                                        role={ROLE.alertdialog}
                                                    >
                                                        <ModalHeader>举报评测</ModalHeader>
                                                        <ModalBody>
                                                            <LabelSmall marginBottom='scale600'>请输入您举报该评测的理由，如果理由不够充分，该操作无效。举报操作无法撤消。</LabelSmall>
                                                            <Textarea readOnly={isReporting} placeholder='请注意文明用语，否则视为无效举报'
                                                                rows='3' maxLength='150' value={reportContent} onChange={(e) => setReportContent(e.target.value)} />
                                                        </ModalBody>
                                                        <ModalFooter>
                                                            <ModalButton kind='tertiary' onClick={() => setIsOpenReportModal(false)}>取消</ModalButton>
                                                            <Button kind='primary' isLoading={isReporting} onClick={() => handleReport()}>确定</Button>
                                                        </ModalFooter>
                                                    </Modal>
                                                </Block>
                                            }
                                        </Block>
                                        {review.meta.gifts > 0 && review.gifts &&
                                            <>
                                                <LabelSmall color='primary400' marginTop='scale300' marginBottom='scale300'>收到的礼物：</LabelSmall>
                                                <Block display='grid' gridGap='scale100' gridAutoFlow='column' width='min-content'>
                                                    {review.gifts.map((gift, index) =>
                                                        <GiftType key={index} src={gift.url} name={gift.name} number={gift.count} description={gift.description} price={gift.price} />)
                                                    }
                                                </Block>
                                            </>
                                        }

                                    </Block>
                                    <ReviewComments review={review} />
                                </Block>
                            </Block>
                            <Block width={LAYOUT_RIGHT} overrides={{
                                Block: {
                                    style: ({ $theme }) => ({
                                        marginLeft: $theme.sizing.scale300,
                                        [MOBILE_BREAKPOINT]: {
                                            margin: '0',
                                            width: '100%',
                                        },
                                    })
                                }
                            }}>
                                {/* 这里展示游戏查看详情） */}
                                <Block marginBottom='scale600'><ReviewAppGlance review={review} /></Block>
                            </Block>
                        </Block>
                    </Block>
                </Block>
            }
        </>
    );
}

export default Review;