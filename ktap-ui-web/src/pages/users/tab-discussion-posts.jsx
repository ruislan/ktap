import React from 'react';
import { Block } from 'baseui/block';
import { LabelMedium, LabelSmall, ParagraphMedium, ParagraphSmall } from 'baseui/typography';
import RouterLink from '../../components/router-link';
import '../../assets/css/post.css';
import { DateTime, PAGE_LIMIT_NORMAL } from '../../constants';
import LoadMore from '../../components/load-more';

function TabDiscussionPosts({ theUser }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [dataList, setDataList] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            if (theUser) {
                try {
                    setIsLoading(true);
                    const res = await fetch(`/api/users/${theUser.id}/discussion-posts?skip=${skip}&limit=${limit}`);
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
    }, [theUser, skip, limit]);

    return (
        <Block display='flex' flexDirection='column' gridGap='scale600'>
            {dataList?.map((post, index) => (
                <Block key={index} display='flex' padding='scale600' flexDirection='column'
                    backgroundColor='backgroundSecondary'
                    overrides={{
                        Block: {
                            style: ({ $theme }) => ({
                                borderRadius: $theme.borders.radius300,
                            }),
                        }
                    }}
                >
                    {post.discussion
                        ? (<LabelMedium marginBottom='scale200'>回复了 <RouterLink href={`/users/${post.discussion.user.id}`} kind='underline'>{post.discussion.user.name}</RouterLink> 对 <RouterLink href={`/apps/${post.discussion.app.id}`} kind='underline'>{post.discussion.app.name}</RouterLink> 的 <RouterLink href={`/reviews/${post.discussion.id}`} kind='underline'>讨论</RouterLink> </LabelMedium>)
                        : (<LabelMedium marginBottom='scale200'>回复了讨论</LabelMedium>)
                    }
                    <LabelSmall color='primary500' marginTop='scale0'>{DateTime.formatCN(post.createdAt)}</LabelSmall>
                    <Block display='flex' flexDirection='column'>
                        <ParagraphMedium className='post' marginBottom='0' dangerouslySetInnerHTML={{ __html: post.content }} />
                        <ParagraphSmall backgroundColor='backgroundTertiary' marginBottom='0' padding='scale300' color='primary200'
                            overrides={{
                                Block: {
                                    style: ({ $theme }) => ({
                                        borderRadius: $theme.borders.radius300,
                                    })
                                }
                            }}
                        >
                            {post.discussion ? post.discussion.title : '该讨论已被删除'}
                        </ParagraphSmall>
                    </Block>
                </Block>
            ))}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='186px' onClick={() => setSkip(prev => prev + limit)} />
        </Block>
    );
}

export default TabDiscussionPosts;