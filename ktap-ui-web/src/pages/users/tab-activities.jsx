import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelMedium, LabelSmall, ParagraphMedium, ParagraphSmall } from 'baseui/typography';

import { Annotation, Bookmark, Star, Gift as GiftIcon, Icon, ChatAlt2Outline } from '@ktap/components/icons';
import RouterLink from '@ktap/components/router-link';
import Gift from '@ktap/components/gift';
import LoadMore from '@ktap/components/load-more';
import { DateTime, MOBILE_BREAKPOINT, PAGE_LIMIT_NORMAL } from '@ktap/libs/utils';
import '@ktap/assets/css/post.css';

function LeftLine({ type }) {
    return (
        <Block display='flex' flexDirection='column'>
            <Block overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        backgroundColor: $theme.colors.backgroundTertiary,
                        borderRadius: $theme.borders.radius300,
                        width: $theme.sizing.scale900,
                        minWidth: $theme.sizing.scale900,
                        height: $theme.sizing.scale900,
                        minHeight: $theme.sizing.scale900,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    })
                }
            }}>
                {(type === 'Review' || type === 'Discussion') && <Icon $size='lg'><Annotation /></Icon>}
                {(type === 'ReviewComment' || type === 'DiscussionPost') && <Icon $size='lg'><ChatAlt2Outline /></Icon>}
                {(type === 'FollowApp' || type == 'FollowUser') && <Icon $size='lg'><Bookmark /></Icon>}
                {(type === 'ReviewGiftRef' || type === 'DiscussionPostGiftRef') && <Icon $size='lg'><GiftIcon /></Icon>}
            </Block>
            <Block height='100%' marginLeft='auto' marginRight='auto' marginTop='scale200' marginBottom='scale200'>
                <Block overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            height: '100%',
                            width: $theme.sizing.scale0,
                            backgroundColor: $theme.colors.backgroundTertiary,
                        })
                    }
                }}>
                </Block>
            </Block>
        </Block>
    );
}

function ActivityItem({ activity }) {
    const [css, theme] = useStyletron();

    if (!activity?.data) return;
    return (
        <>
            <LeftLine type={activity.type} />
            <Block display='flex' width='100%' overflow='hidden' paddingTop='scale100' paddingBottom='scale900' marginLeft='scale300' flexDirection='column'>
                {activity.type === 'Review' && (
                    <>
                        {activity.data.app ?
                            (<LabelMedium marginBottom='scale200'>发表了对 <RouterLink href={`/apps/${activity.data.app.id}`} kind='underline'>{activity.data.app.name}</RouterLink> 的 <RouterLink href={`/reviews/${activity.data.id}`} kind='underline'>评测</RouterLink> ，评分为{activity.data.score}分</LabelMedium>) :
                            (<LabelMedium marginBottom='scale200'>发表了 <RouterLink href={`/reviews/${activity.data.id}`} kind='underline'>评测</RouterLink> ，评分为{activity.data.score}分</LabelMedium>)
                        }
                        <LabelSmall color='primary300'>{DateTime.fromNow(activity.createdAt)}</LabelSmall>
                        <Block display='flex' flexDirection='column'>
                            <ParagraphMedium>{activity.data.content}</ParagraphMedium>
                            <Block display='flex' alignItems='center' padding='scale100' backgroundColor='backgroundSecondary'
                                overrides={{
                                    Block: {
                                        style: ({ $theme }) => ({
                                            borderRadius: $theme.borders.radius300,
                                        })
                                    }
                                }}
                            >
                                {activity.data.app
                                    ? (
                                        <>
                                            <Block display='flex' maxWidth='154px'>
                                                <img width='100%' height='auto' className={css({ borderRadius: theme.borders.radius200 })} src={activity.data.app.media.head.thumbnail} />
                                            </Block>
                                            <Block paddingLeft='scale400' display='flex' flexDirection='column'>
                                                <LabelMedium marginBottom='scale100' color='primary100' overrides={{
                                                    Block: {
                                                        style: {
                                                            [MOBILE_BREAKPOINT]: {
                                                                inlineSize: '168px',
                                                                whiteSpace: 'break-spaces',
                                                            }
                                                        }
                                                    }
                                                }}>
                                                    <RouterLink href={`/apps/${activity.data.app.id}`} kind='underline'>{activity.data.app.name}</RouterLink>
                                                </LabelMedium>
                                                <Block display='flex' alignItems='center'>
                                                    <LabelMedium marginRight='scale0' color='primary100'>{activity.data.app.score}</LabelMedium>
                                                    <Icon><Star /></Icon>
                                                </Block>
                                            </Block>
                                        </>
                                    )
                                    : (<LabelSmall color='primary400' padding='scale100'>该游戏暂不可见</LabelSmall>)
                                }
                            </Block>
                        </Block>
                    </>
                )}
                {activity.type === 'ReviewComment' && (
                    <>
                        {activity.data?.review ?
                            (<LabelMedium marginBottom='scale200'>回复了 <RouterLink href={`/users/${activity.data.review.user.id}`} kind='underline'>{activity.data.review.user.name}</RouterLink> 对 <RouterLink href={`/apps/${activity.data.review.app.id}`} kind='underline'>{activity.data.review.app.name}</RouterLink> 的 <RouterLink href={`/reviews/${activity.data.review.id}`} kind='underline'>评测</RouterLink></LabelMedium>) :
                            (<LabelMedium marginBottom='scale200'>回复了评测</LabelMedium>)
                        }
                        <LabelSmall color='primary300'>{DateTime.fromNow(activity.createdAt)}</LabelSmall>
                        <Block display='flex' flexDirection='column'>
                            <ParagraphMedium marginBottom='0'>{activity.data.content}</ParagraphMedium>
                            <ParagraphSmall backgroundColor='backgroundSecondary' padding='scale300' color='primary200' marginBottom='0'
                                overrides={{
                                    Block: {
                                        style: ({ $theme }) => ({
                                            borderRadius: $theme.borders.radius300,
                                        })
                                    }
                                }}
                            >
                                {activity.data?.review ? activity.data.review.content.slice(0, 100) + (activity.data.review.content.length > 100 ? '...' : '') : '该评测已被删除'}
                            </ParagraphSmall>
                        </Block>
                    </>
                )}
                {activity.type === 'ReviewGiftRef' && (
                    <>
                        {activity.data?.review ?
                            (<LabelMedium marginBottom='scale200'>
                                给 <RouterLink href={`/users/${activity.data.review.user.id}`} kind='underline'>{activity.data.review.user.name}</RouterLink> 的 <RouterLink href={`/reviews/${activity.data.review.id}`} kind='underline'>评测</RouterLink> 赠送了礼物
                            </LabelMedium>) :
                            (<LabelMedium marginBottom='scale200'>给评测赠送了礼物</LabelMedium>)
                        }
                        <LabelSmall color='primary300'>{DateTime.fromNow(activity.createdAt)}</LabelSmall>
                        <Block display='flex' flexDirection='column'>
                            <ParagraphSmall backgroundColor='backgroundSecondary' padding='scale300' color='primary200' marginBottom='0'
                                overrides={{
                                    Block: {
                                        style: ({ $theme }) => ({
                                            borderRadius: $theme.borders.radius300,
                                        })
                                    }
                                }}
                            >
                                {activity.data?.review ? activity.data.review.content.slice(0, 100) + (activity.data.review.content.length > 100 ? '...' : '') : '该评测已被删除'}
                            </ParagraphSmall>
                            <Block marginTop='scale300' width='fit-content'><Gift src={activity.data?.gift.url} name={activity.data?.gift.name} description={activity.data?.gift.description} price={activity.data?.gift.price} /></Block>
                        </Block>
                    </>
                )}
                {activity.type === 'FollowUser' && (
                    <>
                        <LabelMedium marginBottom='scale200'>关注了 <RouterLink href={`/users/${activity.data.id}`} kind='underline'>{activity.data.name}</RouterLink> </LabelMedium>
                        <LabelSmall color='primary300'>{DateTime.fromNow(activity.createdAt)}</LabelSmall>
                    </>
                )}
                {activity.type === 'FollowApp' && (
                    <>
                        {activity.data ?
                            (<LabelMedium marginBottom='scale200'>关注了 <RouterLink href={`/apps/${activity.data.id}`} kind='underline'>{activity.data.name}</RouterLink> </LabelMedium>) :
                            (<LabelMedium marginBottom='scale200'>关注了游戏</LabelMedium>)
                        }
                        <LabelSmall color='primary300'>{DateTime.fromNow(activity.createdAt)}</LabelSmall>
                        <Block marginTop='scale600' display='flex' alignItems='center' padding='scale100' backgroundColor='backgroundSecondary'
                            overrides={{
                                Block: {
                                    style: ({ $theme }) => ({
                                        borderRadius: $theme.borders.radius300,
                                    })
                                }
                            }}
                        >
                            {activity.data ?
                                (<>
                                    <Block display='flex' maxWidth='154px'>
                                        <img width='100%' height='auto' className={css({ borderRadius: theme.borders.radius200 })} src={activity.data.media.head.thumbnail} />
                                    </Block>
                                    <Block paddingLeft='scale400' display='flex' flexDirection='column'>
                                        <LabelMedium marginBottom='scale100' overrides={{
                                            Block: {
                                                style: {
                                                    [MOBILE_BREAKPOINT]: {
                                                        inlineSize: '168px',
                                                        whiteSpace: 'break-spaces',
                                                    }
                                                }
                                            }
                                        }}>
                                            <RouterLink href={`/apps/${activity.data.id}`} kind='underline'>{activity.data.name}</RouterLink>
                                        </LabelMedium>
                                        <Block display='flex' alignItems='center'>
                                            <LabelMedium marginRight='scale0' color='primary100'>{activity.data.score}</LabelMedium>
                                            <Icon><Star /></Icon>
                                        </Block>
                                    </Block>
                                </>) :
                                (<LabelSmall padding='scale100' color='primary200'>该游戏暂不可见</LabelSmall>)
                            }
                        </Block>
                    </>
                )}
                {activity.type === 'Discussion' && (
                    <>
                        {activity.data.app ?
                            (<LabelMedium marginBottom='scale200'>发起了对 <RouterLink href={`/apps/${activity.data.app.id}`} kind='underline'>{activity.data.app.name}</RouterLink> 的 <RouterLink href={`/discussions/${activity.data.id}`} kind='underline'>讨论</RouterLink></LabelMedium>) :
                            (<LabelMedium marginBottom='scale200'>发起了 <RouterLink href={`/discussions/${activity.data.id}`} kind='underline'>讨论</RouterLink></LabelMedium>)
                        }
                        <LabelSmall color='primary300'>{DateTime.fromNow(activity.createdAt)}</LabelSmall>
                        <Block display='flex' flexDirection='column'>
                            <ParagraphMedium >{activity.data.title}</ParagraphMedium>
                            <Block display='flex' alignItems='center' padding='scale100' backgroundColor='backgroundSecondary'
                                overrides={{
                                    Block: {
                                        style: ({ $theme }) => ({
                                            borderRadius: $theme.borders.radius300,
                                        })
                                    }
                                }}
                            >
                                {activity.data.app
                                    ? (
                                        <>
                                            <Block display='flex' maxWidth='154px'>
                                                <img width='100%' height='auto' className={css({ borderRadius: theme.borders.radius200 })} src={activity.data.app.media.head.thumbnail} />
                                            </Block>
                                            <Block paddingLeft='scale400' display='flex' flexDirection='column'>
                                                <LabelMedium marginBottom='scale100' color='primary100' overrides={{
                                                    Block: {
                                                        style: {
                                                            [MOBILE_BREAKPOINT]: {
                                                                inlineSize: '168px',
                                                                whiteSpace: 'break-spaces',
                                                            }
                                                        }
                                                    }
                                                }}>
                                                    <RouterLink href={`/apps/${activity.data.app.id}`} kind='underline'>{activity.data.app.name}</RouterLink>
                                                </LabelMedium>
                                                <Block display='flex' alignItems='center'>
                                                    <LabelMedium marginRight='scale0' color='primary100'>{activity.data.app.score}</LabelMedium>
                                                    <Icon><Star /></Icon>
                                                </Block>
                                            </Block>
                                        </>
                                    )
                                    : (<LabelSmall padding='scale100' color='primary400'>该游戏暂不可见</LabelSmall>)
                                }
                            </Block>
                        </Block>
                    </>
                )}
                {activity.type === 'DiscussionPost' && (
                    <>
                        {activity.data?.discussion ?
                            (
                                <LabelMedium marginBottom='scale200'>回复了 <RouterLink href={`/users/${activity.data.discussion.user.id}`} kind='underline'>{activity.data.discussion.user.name}</RouterLink>
                                    {activity.data.discussion.app &&
                                        <>&nbsp; 对&nbsp;<RouterLink href={`/apps/${activity.data.discussion.app.id}`} kind='underline'>{activity.data.discussion.app.name}</RouterLink></>
                                    } 的 <RouterLink href={`/discussions/${activity.data.discussion.id}`} kind='underline'>讨论</RouterLink></LabelMedium>
                            ) :
                            (<LabelMedium marginBottom='scale200'>回复了讨论</LabelMedium>)
                        }
                        <LabelSmall color='primary300'>{DateTime.fromNow(activity.createdAt)}</LabelSmall>
                        <Block display='flex' flexDirection='column'>
                            <ParagraphMedium className='post' marginBottom='0' dangerouslySetInnerHTML={{ __html: activity.data.content }} />
                            <ParagraphSmall backgroundColor='backgroundSecondary' padding='scale300' color='primary200' marginBottom='0'
                                overrides={{
                                    Block: {
                                        style: ({ $theme }) => ({
                                            borderRadius: $theme.borders.radius300,
                                        })
                                    }
                                }}
                            >
                                {activity.data.discussion ? activity.data.discussion.title : '该讨论已被删除'}
                            </ParagraphSmall>
                        </Block>
                    </>
                )}
                {activity.type === 'DiscussionPostGiftRef' && (
                    <>
                        {activity.data?.post ?
                            (<LabelMedium marginBottom='scale200'>
                                给 <RouterLink href={`/users/${activity.data.post.user.id}`} kind='underline'>{activity.data.post.user.name}</RouterLink> 在 <RouterLink href={`/discussions/${activity.data.post.discussion.id}`} kind='underline'>讨论</RouterLink> 的 回帖 赠送了礼物
                            </LabelMedium>) :
                            (<LabelMedium marginBottom='scale200'>给帖子赠送了礼物</LabelMedium>)
                        }
                        <LabelSmall color='primary300'>{DateTime.fromNow(activity.createdAt)}</LabelSmall>
                        <Block display='flex' flexDirection='column'>
                            <ParagraphSmall className='post' backgroundColor='backgroundSecondary' padding='scale300' color='primary200' marginBottom='0'
                                overrides={{
                                    Block: {
                                        style: ({ $theme }) => ({
                                            borderRadius: $theme.borders.radius300,
                                        })
                                    }
                                }}
                                dangerouslySetInnerHTML={{ __html: activity.data?.post ? activity.data.post.content : '该帖子已被删除' }}
                            />
                            <Block marginTop='scale300' width='fit-content'><Gift src={activity.data?.gift.url} name={activity.data?.gift.name} description={activity.data?.gift.description} price={activity.data?.gift.price} /></Block>
                        </Block>
                    </>
                )}
            </Block >
        </>
    );
}

function TabActivities({ theUser }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [activities, setActivities] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            if (theUser) {
                try {
                    setIsLoading(true);
                    const res = await fetch(`/api/users/${theUser.id}/timeline?skip=${skip}&limit=${limit}`);
                    if (res.ok) {
                        const json = await res.json();
                        setActivities(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                        setHasMore(json.skip + json.limit < json.count);
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        })();
    }, [theUser, skip, limit]);

    return (
        <Block display='flex' flexDirection='column'>
            {activities?.map((activity, index) =>
                <Block key={index} display='flex'>
                    <ActivityItem activity={activity} />
                </Block>
            )}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='180px' onClick={() => setSkip(prev => prev + limit)} />
        </Block>
    );
}

export default TabActivities;