import React from 'react';
import { Block } from 'baseui/block';
import { LabelMedium } from 'baseui/typography';
import { Button } from 'baseui/button';
import { Star } from '../../components/icons';
import { useNavigate } from 'react-router-dom';

function ReviewAppGlance({ review }) {
    const navigate = useNavigate();
    const app = review?.app;
    return (
        <Block backgroundColor='backgroundSecondary'
            overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        borderBottomLeftRadius: $theme.borders.radius300,
                        borderBottomRightRadius: $theme.borders.radius300,
                    })
                }
            }}
        >
            {app
                ? (
                    <>
                        <Block width='100%' maxHeight='168px' overflow='hidden'>
                            <img width='100%' src={app.media?.head?.image}></img>
                        </Block>
                        <Block display='flex' justifyContent='space-between' alignItems='center' padding='scale300' marginTop='scale300'>
                            <Block display='flex' alignItems='center'>
                                <Block width='scale1600'>
                                    <img style={{ borderRadius: '12px', boxShadow: 'rgb(0 0 0) 0px 0px 2px 2px' }} width='100%' src={app.media?.portrait?.image} />
                                </Block>
                                <Block paddingLeft='scale400' display='flex' flexDirection='column'>
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
                            <Block marginRight='scale100'>
                                <Button kind='secondary' onClick={() => navigate(`/apps/${app.id}`)}>详情</Button>
                            </Block>
                        </Block>
                    </>
                )
                : (<LabelMedium padding='scale300' color='primary400'>该游戏暂不可见</LabelMedium>) }

        </Block>
    );
}

export default ReviewAppGlance;