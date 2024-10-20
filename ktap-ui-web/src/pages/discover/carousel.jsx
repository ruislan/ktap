import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelMedium, HeadingSmall, ParagraphMedium, LabelSmall } from 'baseui/typography';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from "swiper/modules";
import 'swiper/css';

import Tag from '@ktap/components/tag';
import { LAYOUT_DEFAULT_CONTENT, LAYOUT_DEFAULT_SIDE, MOBILE_BREAKPOINT } from '@ktap/libs/utils';
import { Icon, Star } from '@ktap/components/icons';

function Carousel({ title, dataList }) {
    const navigate = useNavigate();
    const [css, theme] = useStyletron();
    const [swiper, setSwiper] = React.useState(null);
    const [activeIndex, setActiveIndex] = React.useState(0);

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
            {title && (
                <Block display='flex' justifyContent='space-between' alignItems='center' marginBottom='scale600'>
                    <LabelMedium display='flex' alignItems='center' height='28px'>{title}</LabelMedium>
                </Block>
            )}
            <Block>
                <Swiper modules={[Autoplay]} loop
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: true,
                    }}
                    slidesPerView={1}
                    onSwiper={setSwiper}
                    onSlideChange={swiper => setActiveIndex(swiper.realIndex)}
                >
                    {dataList?.map((data, index) => (
                        <SwiperSlide key={index}>
                            <Link to={data.link} className={css({
                                display: 'flex',
                                width: '100%',
                                borderRadius: theme.borders.radius300,
                                textDecoration: 'none',
                                color: 'inherit',
                                border: 0,
                                [MOBILE_BREAKPOINT]: {
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }
                            })}>
                                {/* 左大图 */}
                                <Block display='flex' width={LAYOUT_DEFAULT_CONTENT} height='353px'
                                    overrides={{
                                        Block: {
                                            style: {
                                                [MOBILE_BREAKPOINT]: {
                                                    height: 'auto',
                                                    width: 'auto'
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <img width='100%' height='100%' src={data.image}
                                        className={css({
                                            borderTopLeftRadius: theme.borders.radius300,
                                            borderBottomLeftRadius: theme.borders.radius300,
                                            [MOBILE_BREAKPOINT]: {
                                                borderBottomLeftRadius: 0,
                                                borderTopRightRadius: theme.borders.radius300,
                                            }
                                        })} />
                                </Block>
                                {/* 右介绍 */}
                                <Block display='flex' flexDirection='column' justifyContent='space-between' width={LAYOUT_DEFAULT_SIDE} padding='scale600'
                                    backgroundColor='backgroundSecondary'
                                    overrides={{
                                        Block: {
                                            style: {
                                                borderTopRightRadius: theme.borders.radius300,
                                                borderBottomRightRadius: theme.borders.radius300,
                                                [MOBILE_BREAKPOINT]: {
                                                    margin: 0,
                                                    width: '100%',
                                                    background: 'linear-gradient(180deg, rgb(31, 31, 31) 0%, rgba(31, 31, 31, 0.2) 100%)',
                                                    overflow: 'hidden',
                                                    borderTopRightRadius: 0,
                                                    borderBottomRightRadius: theme.borders.radius300,
                                                }
                                            }
                                        }
                                    }}
                                >
                                    {/* 名称，评分，介绍区 */}
                                    <HeadingSmall whiteSpace='nowrap' textOverflow='ellipsis' overflow='hidden' maxHeight='scale1600' marginTop='0' marginBottom='scale300' overrides={{
                                        Block: {
                                            style: {
                                                lineHeight: theme.sizing.scale850
                                            }
                                        }
                                    }}>{data.name}</HeadingSmall>
                                    <Block display='flex' alignItems='center' justifyContent='flex-start'>
                                        <LabelMedium marginRight='scale0'>{data.score}</LabelMedium>
                                        <Icon><Star /></Icon>
                                    </Block>
                                    <ParagraphMedium marginTop='scale300' marginBottom='scale300' flex={1} overrides={{
                                        Block: {
                                            style: {
                                                display: '-webkit-box',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxHeight: '144px',
                                                '-webkit-box-orient': 'vertical',
                                                '-webkit-line-clamp': 6,
                                                [MOBILE_BREAKPOINT]: {
                                                    maxHeight: '74px',
                                                    '-webkit-line-clamp': 3,
                                                }
                                            }
                                        }
                                    }}>{data.summary}</ParagraphMedium>
                                    <Block display='flex' flexDirection='column'>
                                        <Block marginBottom='scale300' display='flex' alignItems='center' flexWrap gridGap='scale300' overrides={{
                                            Block: {
                                                style: {
                                                    maxHeight: '64px',
                                                    overflow: 'hidden',
                                                }
                                            }
                                        }}>
                                            {data.tags && data.tags.map((tag, j) => <Tag key={j} onClick={e => {
                                                e.preventDefault();
                                                navigate(`/tags/${tag.name}`);
                                            }}>{tag.name}</Tag>)}
                                        </Block>
                                        <LabelSmall color='primary300'>{data.meta?.reviews} 条评测</LabelSmall>
                                    </Block>
                                </Block>
                            </Link>
                        </SwiperSlide>
                    ))}
                    <Block slot='container-end' display='flex' justifyContent='center'>
                        {dataList?.map((_, index) => (
                            <Block key={index} selected={index === activeIndex} onClick={() => swiper?.slideTo(index)}
                                overrides={{
                                    Block: {
                                        style: ({ $theme }) => ({
                                            cursor: 'pointer',
                                            width: $theme.sizing.scale600,
                                            height: $theme.sizing.scale400,
                                            marginTop: $theme.sizing.scale500,
                                            marginBottom: $theme.sizing.scale500,
                                            marginLeft: $theme.sizing.scale0,
                                            marginRight: $theme.sizing.scale0,
                                            borderRadius: $theme.sizing.scale0,
                                            backgroundColor: index == activeIndex ? 'hsla(202,60%,100%,0.4)' : 'hsla(202,60%,100%,0.2)',
                                            ':hover': {
                                                backgroundColor: 'hsla(202,60%,100%,0.3)'
                                            }
                                        })
                                    }
                                }}
                            ></Block>
                        ))}
                    </Block>
                </Swiper>
            </Block>
        </Block>
    );
}

export default Carousel;
