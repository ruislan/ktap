import React from 'react';
import dayjs from 'dayjs';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelSmall, LabelMedium, ParagraphMedium } from 'baseui/typography';
import { useAuth } from '../../hooks/use-auth';
import RouterLink from '../../components/router-link';
import { Star } from '../../components/icons';
import LoadMore from '../../components/load-more';
import { PAGE_LIMIT_NORMAL } from '../../constants';

function TabDiscussions({ theUser }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [css, theme] = useStyletron();
    const [dataList, setDataList] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const { user } = useAuth();

    React.useEffect(() => {
        (async () => {
            if (theUser) {
                try {
                    setIsLoading(true);
                    const res = await fetch(`/api/users/${theUser.id}/discussions?skip=${skip}&limit=${limit}`);
                    if (res.ok) {
                        const json = await res.json();
                        setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
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
            {dataList?.map((discussion, index) => (
                <Block key={index} display='flex' flexDirection='column' padding='scale600' marginBottom='scale300' backgroundColor='backgroundSecondary'
                    overrides={{
                        Block: {
                            style: ({ $theme }) => ({
                                borderBottomLeftRadius: $theme.borders.radius300,
                                borderBottomRightRadius: $theme.borders.radius300,
                            })
                        }
                    }}
                >
                    {discussion.app ?
                        (<LabelMedium marginBottom='scale200'>发起了对 <RouterLink href={`/apps/${discussion.app.id}`} kind='underline'>{discussion.app.name}</RouterLink> 的 <RouterLink href={`/discussions/${discussion.id}`} kind='underline'>讨论</RouterLink></LabelMedium>) :
                        (<LabelMedium marginBottom='scale200'>发起了 <RouterLink href={`/discussions/${discussion.id}`} kind='underline'>讨论</RouterLink></LabelMedium>)
                    }
                    <LabelSmall color='primary300'>{dayjs(discussion.createdAt).fromNow()}</LabelSmall>
                    <Block display='flex' flexDirection='column'>
                        <ParagraphMedium>{discussion.title}</ParagraphMedium>
                        <Block display='flex' alignItems='center' padding='scale300' backgroundColor='backgroundTertiary'
                            overrides={{
                                Block: {
                                    style: ({ $theme }) => ({
                                        borderRadius: $theme.borders.radius300,
                                    })
                                }
                            }}
                        >
                            {discussion.app
                                ? (
                                    <>
                                        <Block display='flex' maxWidth='154px'>
                                            <img width='100%' height='auto' className={css({ borderRadius: theme.borders.radius200 })} src={discussion.app.media.head.thumbnail} />
                                        </Block>
                                        <Block paddingLeft='scale400' display='flex' flexDirection='column'>
                                            <LabelMedium marginBottom='scale100' color='primary100' overrides={{
                                                Block: {
                                                    style: {
                                                        inlineSize: '168px',
                                                        whiteSpace: 'break-spaces',
                                                    }
                                                }
                                            }}>
                                                <RouterLink href={`/apps/${discussion.app.id}`} kind='underline'>{discussion.app.name}</RouterLink>
                                            </LabelMedium>
                                            <Block display='flex' alignItems='center'>
                                                <LabelMedium marginRight='scale0' color='primary100'>{discussion.app.score}</LabelMedium>
                                                <Star width='20px' height='20px' />
                                            </Block>
                                        </Block>
                                    </>
                                )
                                : (<LabelMedium color='primary400'>该游戏暂不可见</LabelMedium>)
                            }
                        </Block>
                    </Block>
                </Block>
            ))}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='186px' onClick={() => setSkip(prev => prev + limit)} />
        </Block>
    );
}

export default TabDiscussions;