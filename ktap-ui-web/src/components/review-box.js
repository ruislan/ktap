import React from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { LabelLarge, LabelMedium, LabelSmall, LabelXSmall, ParagraphMedium, ParagraphSmall } from 'baseui/typography';

import { useAuth } from '../hooks/use-auth';
import useScoreRemark from '../hooks/use-score-remark';
import { DateTime, Styles } from '../constants';
import { ChevronRight, Gift, Star, ThumbDown, ThumbUp } from './icons';
import ImageBoxGallery from './image-box-gallery';
import GiftType from './gift';
import RouterLink from './router-link';
import GenderLabel from './gender-label';
import AvatarSquare from './avatar-square';

const Header = React.memo(function ({ id, score = 0, }) {
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
const Content = React.memo(function ({ id, images, content, updatedAt, }) {
    return (
        <Block paddingTop='scale300' paddingBottom='scale300'>
            <LabelSmall color='primary500' marginTop='scale300'>发布于：{DateTime.formatCN(updatedAt)}</LabelSmall>
            <ParagraphMedium dangerouslySetInnerHTML={{ __html: content.replace(/\r\n/g, '<br>') }}></ParagraphMedium>
            <Block display='flex' alignItems='baseline' paddingBottom='scale100'>
                <ImageBoxGallery id={`list-ibg-${id}`} images={images} />
            </Block>
        </Block>
    );
});

// 操作按钮
const Actions = function ({ review }) {
    const navigate = useNavigate();
    const { user } = useAuth();
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
        <Block paddingTop='scale300' paddingBottom='scale300' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    borderStyle: 'solid', borderColor: $theme.borders.border200.borderColor,
                    borderTopWidth: '1px', borderBottomWidth: '0', borderLeftWidth: '0', borderRightWidth: '0',
                })
            }
        }}>
            <LabelSmall marginTop='scale300' color='primary400'>这篇评测你这么看？</LabelSmall>
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
    );
};

const AppInfo = function ({ app }) {
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
};

const Comments = React.memo(function ({ id, comments, count }) {
    const navigate = useNavigate();
    if (!comments || comments.length === 0) return null;
    return (
        <Block paddingTop='scale300' paddingBottom='scale300' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    borderStyle: 'solid', borderColor: $theme.borders.border200.borderColor,
                    borderTopWidth: '1px', borderBottomWidth: '0', borderLeftWidth: '0', borderRightWidth: '0',
                })
            }
        }}>
            <Block display='flex' paddingTop='scale300' paddingBottom='scale300'>
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
                <Block display='flex' paddingTop='scale100'>
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

const User = React.memo(function ({ user }) {
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

const ReviewBox = function ({ review, include = {} }) {
    if (!review) return null;
    return (
        <Block display='flex' flexDirection='column' marginBottom='scale300' backgroundColor='backgroundSecondary'
            overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        borderBottomLeftRadius: $theme.borders.radius300,
                        borderBottomRightRadius: $theme.borders.radius300,
                        borderTopLeftRadius: include.header ? null : $theme.borders.radius300,
                        borderTopRightRadius: include.header ? null : $theme.borders.radius300,
                    })
                }
            }}
        >
            {include.header && <Header id={review.id} score={review.score} />}
            <Block padding='scale600'>
                {include.app && <AppInfo app={review.app} />}
                {include.user && <User user={review.user} />}
                <Content id={review.id} images={review.images} content={review.content} updatedAt={review.updatedAt} />
                <Actions review={review} />
                {include.comments && <Comments comments={review.comments} count={review.meta.comments} />}
            </Block>
        </Block>
    );
}

export default ReviewBox;






