import React from 'react';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelMedium, LabelXSmall } from 'baseui/typography';
import { MOBILE_BREAKPOINT, MOBILE_BREAKPOINT_PX } from '../../libs/utils';
import { Button } from 'baseui/button';
import { ArrowLeft, ArrowRight } from 'baseui/icon';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Link } from 'react-router-dom';

function CardListApp({ title, dataList, perViewSize = 4, }) {
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
                                <Block padding='scale300' backgroundColor='backgroundSecondary'
                                    overrides={{
                                        Block: {
                                            style: {
                                                borderBottomLeftRadius: theme.borders.radius300,
                                                borderBottomRightRadius: theme.borders.radius300,
                                            }
                                        }
                                    }}
                                >
                                    <LabelXSmall>{data.name}</LabelXSmall>
                                </Block>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Block>
        </Block>
    );
}

export default CardListApp;
