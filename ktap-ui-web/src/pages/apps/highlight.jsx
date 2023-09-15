import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelSmall, ParagraphMedium } from 'baseui/typography';
import { Button } from 'baseui/button';
import { ArrowLeft, ArrowRight } from 'baseui/icon';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Thumbs } from 'swiper/modules';

import { AppMedia, MOBILE_BREAKPOINT } from '@ktap/libs/utils';
import RouterLink from '@ktap/components/router-link';
import { Icon, Play } from '@ktap/components/icons';
import '@ktap/assets/css/swiper.css';

function Highlight({ data }) {
    const slides = data.media.filter(m => m.usage === AppMedia.usage.gallery).map(m => {
        return {
            id: m.id,
            type: m.video ? 'video' : 'image',
            poster: m.video ? m.image : null,
            src: m.video || m.image,
            thumbnail: m.thumbnail,
        };
    });

    const [css, theme] = useStyletron();
    const [thumbsSwiper, setThumbsSwiper] = React.useState(null);
    const [allowSlidePrev, setAllowSlidePrev] = React.useState(false);
    const [allowSlideNext, setAllowSlideNext] = React.useState(false);
    const slideNext = () => thumbsSwiper?.slideNext();
    const slidePrev = () => thumbsSwiper?.slidePrev();

    return (
        <>
            <Block width='100%'>
                <Swiper spaceBetween={8}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    modules={[FreeMode, Thumbs]}
                    className={css({ marginBottom: theme.sizing.scale600, })}
                >
                    {slides.map((slide, index) => (
                        <SwiperSlide key={index}>
                            {slide.type === 'video' ? (
                                <video controls
                                    className={css({
                                        display: 'block',
                                        width: '100%',
                                        borderRadius: theme.borders.radius300,
                                        '-webkit-user-drag': 'none',
                                        objectFit: 'contain',
                                        border: 'none',
                                        padding: '0',
                                        margin: '0',
                                        [MOBILE_BREAKPOINT]: { borderRadius: '0' },
                                    })}
                                    preload='metadata'
                                    poster={slide.poster}
                                    src={slide.src}
                                >抱歉，您的浏览器不支持内嵌视频.</video>) :
                                (<img className={css({
                                    display: 'block',
                                    width: '100%',
                                    '-webkit-user-drag': 'none',
                                    border: 'none',
                                    borderRadius: theme.borders.radius300,
                                    padding: '0',
                                    margin: '0',
                                    [MOBILE_BREAKPOINT]: { borderRadius: '0' },
                                })} src={slide.src} />)
                            }
                        </SwiperSlide>
                    ))}
                </Swiper>
                <Block display='flex' gridGap='scale600' alignItems='center' width='100%'>
                    <Block overrides={{
                        Block: {
                            style: {
                                [MOBILE_BREAKPOINT]: {
                                    marginLeft: theme.sizing.scale300,
                                }
                            }
                        }
                    }}><Button kind='secondary' size='mini' shape='circle' onClick={slidePrev} disabled={!allowSlidePrev}><ArrowLeft width='18px' /></Button></Block>
                    <Block flex={1} overrides={{
                        Block: {
                            style: {
                                maxWidth: 'calc(616px - 88px)',
                                [MOBILE_BREAKPOINT]: {
                                    maxWidth: 'calc(100vw - 104px)',
                                }
                            }
                        }
                    }}>
                        <Swiper
                            onSwiper={(swiper) => {
                                setThumbsSwiper(swiper);
                                setAllowSlideNext(!swiper.isEnd);
                            }}
                            spaceBetween={6}
                            breakpoints={{
                                480: { slidesPerView: 4, slidesPerGroup: 4 }
                            }}
                            slidesPerView={3}
                            slidesPerGroup={3}
                            freeMode={true}
                            watchSlidesProgress={true}
                            modules={[FreeMode]}
                            className='swiper-thumb'
                            onSlideChange={(swiper) => {
                                setAllowSlideNext(!swiper.isEnd);
                                setAllowSlidePrev(!swiper.isBeginning);
                            }}
                        >
                            {slides.map((slide, index) => (
                                <SwiperSlide key={index} className={css({
                                    cursor: 'pointer',
                                    opacity: 0.6, minHeight: '70px',
                                    transition: 'opacity 0.5s',
                                    ':hover': { opacity: '1' },
                                    [MOBILE_BREAKPOINT]: {
                                        minHeight: '40px',
                                    }
                                })}>
                                    {slide.type === 'video' && <div className={css({
                                        display: 'flex', alignItems: 'center', position: 'absolute',
                                        justifyContent: 'center', width: '100%', height: '100%',
                                    })}><Icon $size='3xl'><Play/></Icon></div>}
                                    <img className={css({
                                        display: 'block', objectFit: 'cover',
                                        width: '100%', height: '100%',
                                        borderRadius: theme.borders.radius200,
                                    })} src={slide.thumbnail} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </Block>
                    <Block overrides={{
                        Block: {
                            style: {
                                [MOBILE_BREAKPOINT]: {
                                    marginRight: theme.sizing.scale300,
                                }
                            }
                        }
                    }}><Button kind='secondary' size='mini' shape='circle' onClick={slideNext} disabled={!allowSlideNext}><ArrowRight width='18px' /></Button></Block>
                </Block>
            </Block>
            <ParagraphMedium color='primary100' maxHeight='100px' marginTop='scale800' marginBottom='scale800' paddingRight='scale100'
                overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            display: '-webkit-box',
                            overflow: 'hidden',
                            '-webkit-box-orient': 'vertical',
                            '-webkit-line-clamp': 4,
                            [MOBILE_BREAKPOINT]: {
                                paddingLeft: $theme.sizing.scale300,
                                paddingRight: $theme.sizing.scale300
                            }
                        })
                    }

                }}
            >
                {data?.summary}
            </ParagraphMedium>
            <Block display='flex' alignItems='stretch' marginTop='scale800' marginBottom='scale800'
                overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            [MOBILE_BREAKPOINT]: {
                                paddingLeft: $theme.sizing.scale300,
                                paddingRight: $theme.sizing.scale300
                            }
                        })
                    }
                }}
            >
                <Block paddingLeft='scale600' paddingRight='scale600' paddingBottom='scale100' display='flex' flexDirection='column' flex='1 1 33.33333%'
                    overrides={{
                        Block: {
                            style: {
                                borderLeft: '1px solid rgba(255, 255, 255, 0.4)'
                            }
                        }
                    }}
                >
                    <Block marginBottom='scale300'><LabelSmall color='primary400'>类型</LabelSmall></Block>
                    <Block display='flex' gridGap='scale300' flexWrap='wrap'>
                        {data.genres.map((genre, index) =>
                            <LabelSmall key={index} overrides={{ Block: { style: { ':first-child': { marginLeft: 0 } } } }}>
                                <RouterLink href={`/tags/${genre.name}`} kind='underline'>{genre.name}</RouterLink>
                            </LabelSmall>
                        )}
                    </Block>
                </Block>
                <Block paddingLeft='scale600' paddingRight='scale600' paddingBottom='scale100' display='flex' flexDirection='column' flex='1 1 33.33333%'
                    overrides={{
                        Block: {
                            style: {
                                borderLeft: '1px solid rgba(255, 255, 255, 0.4)'
                            }
                        }
                    }}
                >
                    <Block marginBottom='scale300'><LabelSmall color='primary400'>功能</LabelSmall></Block>
                    <Block display='flex' gridGap='scale300' flexWrap='wrap'>
                        {data.features.map((feature, index) =>
                            <LabelSmall key={index} overrides={{ Block: { style: { ':first-child': { marginLeft: 0 } } } }}>
                                <RouterLink href={`/tags/${feature.name}`} kind='underline'>{feature.name}</RouterLink>
                            </LabelSmall>
                        )}
                    </Block>
                </Block>
            </Block>
        </>
    );
}

export default Highlight;