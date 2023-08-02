import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Block } from "baseui/block";
import { Button } from 'baseui/button';
import { HeadingSmall, LabelSmall } from 'baseui/typography';
import { Skeleton } from 'baseui/skeleton';
import { Eye } from '../../components/icons';
import { DateTime, MOBILE_BREAKPOINT } from '../../constants';
import '../../assets/css/post.css';

function NewsDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(true);
    const [data, setData] = React.useState({});

    React.useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/news/${id}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json.data);
                } else {
                    throw { status: res.status };
                }
            } catch (error) {
                if (error?.status === 404) navigate('/not-found', { replace: true });
                else navigate('/not-work');
            } finally {
                setIsLoading(false);
            }
        })();
    }, [id, navigate]);

    return (
        <Block display='flex' flexDirection='column' alignItems='center' width='100%'>
            {isLoading ?
                <Block width='100%' display='flex' alignItems='center' flexDirection='column'>
                    <Skeleton width='100vw' height='24vw' animation />
                    <Block overrides={{
                        Block: {
                            style: {
                                width: '664px',
                                height: '100vh',
                                [MOBILE_BREAKPOINT]: {
                                    marginTop: '0',
                                    width: '100%',
                                }
                            }
                        }
                    }}>
                        <Skeleton width='100%' height='100%' animation />
                    </Block>
                </Block> :
                <>
                    {data.banner &&
                        <Block overrides={{
                            Block: {
                                style: {
                                    height: '24vw',
                                    width: '100%',
                                    backgroundImage: `url(${data.banner})`,
                                    backgroundSize: 'cover',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center 70%',
                                    [MOBILE_BREAKPOINT]: {
                                        marginTop: 0,
                                    }
                                }
                            }
                        }} />
                    }
                    <Block
                        flexDirection='column'
                        backgroundColor='backgroundSecondary'
                        width='664px'
                        overrides={{
                            Block: {
                                style: ({ $theme }) => ({
                                    boxShadow: '0 0 15px rgb(0 0 0 / 40%)',
                                    marginTop: data.banner ? '-5%' : $theme.sizing.scale900,
                                    borderRadius: $theme.borders.radius300,
                                    [MOBILE_BREAKPOINT]: {
                                        marginTop: '0',
                                        width: '100%',
                                    }
                                })
                            }
                        }}>
                        <Block paddingLeft='scale900' paddingRight='scale900' paddingBottom='scale900'
                            overrides={{
                                Block: {
                                    style: ({ $theme }) => ({
                                        [MOBILE_BREAKPOINT]: {
                                            paddingLeft: $theme.sizing.scale600,
                                            paddingRight: $theme.sizing.scale600,
                                        }
                                    })
                                }
                            }}
                        >
                            <HeadingSmall marginBottom='scale800'>{data.title}</HeadingSmall>
                            <Block display='flex' alignItems='center' marginBottom='scale1000'>
                                <LabelSmall color='primary300'>{DateTime.formatCN(data.updatedAt)}</LabelSmall>
                                <Block display='flex' alignItems='center' marginLeft='scale600'>
                                    <LabelSmall display='flex' color='primary300'><Eye width='18px' height='18px' /></LabelSmall>
                                    <LabelSmall color='primary300' marginLeft='scale100'>{data.meta.views} 阅读</LabelSmall>
                                </Block>
                            </Block>
                            <div className='post' dangerouslySetInnerHTML={{ __html: data.content }}></div>
                        </Block>
                    </Block >

                    <Block marginTop='scale900'>
                        <Button onClick={() => window.history.back()} kind='tertiary'>返回</Button>
                    </Block>
                </>
            }
        </Block>
    );
}

export default NewsDetail;