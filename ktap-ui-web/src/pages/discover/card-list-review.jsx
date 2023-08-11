import React from 'react';
import { Link } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelLarge, LabelMedium, ParagraphSmall, LabelSmall, LabelXSmall } from 'baseui/typography';
import { Button } from 'baseui/button';
import { ArrowLeft, ArrowRight } from 'baseui/icon';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import { MOBILE_BREAKPOINT, MOBILE_BREAKPOINT_PX } from '@ktap/libs/utils';
import { Star } from '@ktap/components/icons';
import AvatarSquare from '@ktap/components/avatar-square';
import GenderLabel from '@ktap/components/gender-label';

function CardListReview({ title, dataList, perViewSize = 4, }) {
    const [css, theme] = useStyletron();
    const [swiper, setSwiper] = React.useState(null);
    const [allowSlidePrev, setAllowSlidePrev] = React.useState(false);
    const [allowSlideNext, setAllowSlideNext] = React.useState(false);

    React.useEffect(() => {
        setAllowSlideNext(dataList.length > perViewSize);
    }, [dataList, perViewSize]);

    const slideNext = React.useCallback(() => {
        if (swiper) swiper.slideNext();
    }, [swiper]);

    const slidePrev = React.useCallback(() => {
        if (swiper) swiper.slidePrev();
    }, [swiper]);

    return (
        <Block display='flex' marginBottom='scale1200' flexDirection='column'
            overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            paddingLeft: $theme.sizing.scale300,
                            paddingRight: $theme.sizing.scale300,
                        }
                    })
                }
            }}
        >
            <Block display='flex' justifyContent='space-between' alignItems='center' marginBottom='scale600'>
                <LabelMedium display='flex' alignItems='center' height='28px'>{title}</LabelMedium>
                {(allowSlidePrev || allowSlideNext) && (
                    <Block display='flex' justifyContent='center' alignItems='center' gridGap='scale100'>
                        <Button disabled={!allowSlidePrev} onClick={slidePrev} kind='secondary' shape='circle' size='mini'><ArrowLeft width={16} /></Button>
                        <Button disabled={!allowSlideNext} onClick={slideNext} kind='secondary' shape='circle' size='mini'><ArrowRight width={16} /></Button>
                    </Block>
                )}
            </Block>
            <Block>
                <Swiper
                    spaceBetween={8}
                    breakpoints={{
                        [MOBILE_BREAKPOINT_PX]: {
                            slidesPerView: perViewSize,
                            slidesPerGroup: perViewSize,
                        }
                    }}
                    slidesPerView={1.5}
                    onSwiper={setSwiper}
                    onSlideChange={(swiper) => {
                        setAllowSlideNext(!swiper.isEnd);
                        setAllowSlidePrev(!swiper.isBeginning);
                    }}
                >
                    {dataList?.map((data, index) => (
                        <SwiperSlide key={index}>
                            <Link to={data.link}
                                className={css({
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: theme.borders.radius300,
                                    textDecoration: 'none',
                                    color: 'inherit',
                                })}
                            >
                                <Block display='flex'><img width='100%' src={data.image} className={css({ borderTopLeftRadius: theme.borders.radius300, borderTopRightRadius: theme.borders.radius300 })} /></Block>
                                <Block display='flex' flexDirection='column' padding='scale300' backgroundColor='backgroundSecondary'
                                    overrides={{
                                        Block: {
                                            style: {
                                                borderBottomLeftRadius: theme.borders.radius300,
                                                borderBottomRightRadius: theme.borders.radius300,
                                            }
                                        }
                                    }}
                                >
                                    <LabelLarge whiteSpace='nowrap' textOverflow='ellipsis' overflow='hidden'>{data.app.name}</LabelLarge>
                                    <ParagraphSmall overrides={{
                                        Block: {
                                            style: {
                                                height: '60px',
                                                display: '-webkit-box',
                                                overflow: 'hidden',
                                                '-webkit-box-orient': 'vertical',
                                                '-webkit-line-clamp': 3,
                                            }
                                        }
                                    }}>{data.content}</ParagraphSmall>
                                    <Block display='flex' alignItems='center' justifyContent='space-between'>
                                        <Block display='flex' alignItems='center'>
                                            <Block display='flex' alignItems='center'><AvatarSquare size='scale900' src={data.user.avatar} /></Block>
                                            <Block display='flex' flexDirection='column' marginLeft='scale100'>
                                                <Block display='flex' alignItems='center'>
                                                    <LabelSmall marginRight='scale100'>{data.user.name}</LabelSmall>
                                                    <GenderLabel gender={data.user.gender} />
                                                </Block>
                                                <LabelXSmall color='primary300'>{data.user.title}</LabelXSmall>
                                            </Block>
                                        </Block>
                                        <Block display='flex' alignItems='center'>
                                            <LabelMedium marginRight='scale0'>{data.score}</LabelMedium>
                                            <Star width='20' />
                                        </Block>
                                    </Block>
                                </Block>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Block>
        </Block>
    );
}

export default CardListReview;
