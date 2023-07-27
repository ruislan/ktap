import React from 'react';
import dayjs from 'dayjs';
import { useNavigate } from "react-router-dom";
import { Block } from 'baseui/block';
import { LabelSmall, LabelMedium, ParagraphMedium, ParagraphSmall, LabelXSmall, LabelLarge } from 'baseui/typography';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, ROLE } from 'baseui/modal';
import { Button } from 'baseui/button';
import { ThumbUp, ThumbDown, Gift, ChevronRight, Star } from '../../components/icons';
import { PAGE_LIMIT_NORMAL, Styles } from '../../constants';
import { useAuth } from '../../hooks/use-auth';
import ImageBoxGallery from '../../components/image-box-gallery';
import GiftType from '../../components/gift';
import useScoreRemark from '../../hooks/use-score-remark';
import RouterLink from '../../components/router-link';
import { Skeleton } from 'baseui/skeleton';

function TabReviewsListItem({ review }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { remark, color } = useScoreRemark({ score: review.score });
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
        if (!user) { navigate('/login'); return; }
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

    return (
        <Block display='flex' flexDirection='column' marginBottom='scale300' backgroundColor='backgroundSecondary'
            overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        borderBottomLeftRadius: $theme.borders.radius300,
                        borderBottomRightRadius: $theme.borders.radius300,
                    })
                }
            }}
        >
            <Block
                onClick={() => navigate(`/reviews/${review.id}`)}
                overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: 'rgb(0 0 0) 2px 2px 2px',
                            backgroundImage: `linear-gradient(to right, ${color}99, ${color}66)`,
                            padding: $theme.sizing.scale600,
                            borderTopLeftRadius: $theme.borders.radius300,
                            borderTopRightRadius: $theme.borders.radius300,
                            cursor: 'pointer',
                            ':hover': {
                                backgroundColor: 'rgb(64, 64, 64)',
                            },
                        })
                    }
                }}
            >
                <LabelMedium color='inherit' overrides={{
                    Block: {
                        style: {
                            fontWeight: 700,
                        }
                    }
                }}>
                    {remark}
                </LabelMedium>
                <Block display='flex' alignItems='center'>
                    <Block display='flex' alignItems='center'>
                        <LabelMedium color='inherit' marginLeft='scale0' marginRight='scale100'>{review.score}</LabelMedium>
                        <Star width={18} height={18} />
                    </Block>
                </Block>
            </Block>
            <Block padding='scale600'>
                <Block display='flex' alignItems='center' backgroundColor='backgroundTertiary' padding='scale300' overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            borderRadius: $theme.borders.radius300,
                        })
                    }
                }}>
                    {review.app
                        ? (
                            <>
                                <Block display='flex' maxWidth='196px'>
                                    <img width='100%' height='auto' src={review.app?.media?.head?.thumbnail} />
                                </Block>
                                <Block paddingLeft='scale400' display='flex' flexDirection='column'>
                                    <RouterLink href={`/apps/${review.app?.id}`} kind='underline'>
                                        <LabelMedium marginBottom='scale100' overrides={{
                                            Block: {
                                                style: {
                                                    inlineSize: '168px',
                                                    whiteSpace: 'break-spaces',
                                                }
                                            }
                                        }}>{review.app?.name}</LabelMedium>
                                    </RouterLink>
                                    <Block display='flex' alignItems='center' justifyContent='flex-start'>
                                        <Block marginRight='scale0' font='font300'>{review.app?.score}</Block>
                                        <Star width='20px' height='20px' />
                                    </Block>
                                </Block>
                            </>)
                        : (<LabelMedium color='primary400'>该游戏暂不可见</LabelMedium>)
                    }
                </Block>
                {/* 内容 */}
                <Block paddingTop='scale300' paddingBottom='scale300'>
                    <LabelSmall color='primary500' marginTop='scale300'>发布于：{dayjs(review.updatedAt).format('YYYY 年 M 月 D 日')}</LabelSmall>
                    <ParagraphMedium dangerouslySetInnerHTML={{ __html: review.content.replace(/\r\n/g, '<br>') }}></ParagraphMedium>
                    <Block display='flex' alignItems='baseline' paddingBottom='scale100'>
                        <ImageBoxGallery id={`list-ibg-${review.id}`} images={review.images} />
                    </Block>
                </Block>
                <Block paddingTop='scale300' paddingBottom='scale300' overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            borderStyle: 'solid',
                            borderColor: $theme.borders.border200.borderColor,
                            borderTopWidth: '1px',
                            borderBottomWidth: '0',
                            borderLeftWidth: '0',
                            borderRightWidth: '0',
                        })
                    }
                }}>
                    <LabelSmall color='primary400'>TA的评测你这么看？</LabelSmall>
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
                {/* 如果有回复才显示，最佳回复（点赞最多的回复），这里只显示一条，点击显示更多跳转到专门的评测详情去 */}
                {review.comments.length > 0 && (
                    <Block paddingTop='scale300' paddingBottom='scale300' overrides={{
                        Block: {
                            style: ({ $theme }) => ({
                                borderStyle: 'solid',
                                borderColor: $theme.borders.border200.borderColor,
                                borderTopWidth: '1px',
                                borderBottomWidth: '0',
                                borderLeftWidth: '0',
                                borderRightWidth: '0',
                            })
                        }
                    }}>
                        <Block display='flex' paddingTop='scale300' paddingBottom='scale300'>
                            <LabelMedium color='primary100' overrides={{
                                Block: {
                                    style: {
                                        fontWeight: 'bold',
                                    }
                                }
                            }}>{review.comments[0].user.name}：</LabelMedium>
                            <LabelMedium color='primary300'>{review.comments[0].content}</LabelMedium>
                        </Block>
                        {/* 如果有2条以上才显示 */}
                        {review.meta.comments > 1 && (
                            <Block display='flex' paddingTop='scale100'>
                                <LabelSmall
                                    onClick={() => navigate(`/reviews/${review.id}`)}
                                    color='primary100'
                                    overrides={{
                                        Block: {
                                            style: {
                                                cursor: 'pointer',
                                            }
                                        }
                                    }}>全部 {review.meta.comments} 条回复</LabelSmall>
                                <ChevronRight width={16} height={16} />
                            </Block>
                        )}
                    </Block>
                )}
            </Block>
        </Block>
    );
}

function TabReviews({ theUser }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [reviews, setReviews] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const { user } = useAuth();

    React.useEffect(() => {
        (async () => {
            if (theUser) {
                try {
                    setIsLoading(true);
                    const res = await fetch(`/api/users/${theUser.id}/reviews?skip=${skip}&limit=${limit}`);
                    if (res.ok) {
                        const json = await res.json();
                        if (user && json.data && json.data.length > 0) {
                            const thumbRes = await fetch(`/api/user/effect/reviews/thumbs?ids=${json.data.map(v => v.id).join(',')}`);
                            if (thumbRes.ok) {
                                const thumbJson = await thumbRes.json();
                                json.data.forEach(review => review.viewer = { direction: thumbJson.data[review.id] });
                            }
                        }
                        setReviews(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                        setHasMore(json.skip + json.limit < json.count);
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        })();
    }, [theUser, skip, limit, user]);

    return (
        <Block display='flex' flexDirection='column'>
            {reviews?.map((review, index) => (
                <TabReviewsListItem key={index} review={review} />
            ))}
            {isLoading && <Block display='flex' flexDirection='column' marginTop='scale300' marginBottom='scale300' gridGap='scale300' justifyContent='center'>
                <Skeleton animation height='380px' width='100%' />
                <Skeleton animation height='380px' width='100%' />
                <Skeleton animation height='380px' width='100%' />
            </Block>}
            {hasMore && !isLoading &&
                <Block marginTop='scale800' display='flex' justifyContent='center'>
                    <Button size='default' kind='tertiary' isLoading={isLoading} onClick={() => setSkip(prev => prev + limit)}>
                        查看更多
                    </Button>
                </Block>
            }
        </Block>
    );
}

export default TabReviews;