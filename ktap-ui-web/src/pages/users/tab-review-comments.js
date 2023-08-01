import React from 'react';
import { Block } from 'baseui/block';
import { LabelMedium, LabelSmall, ParagraphMedium, ParagraphSmall } from 'baseui/typography';
import RouterLink from '../../components/router-link';
import { DateTime, PAGE_LIMIT_NORMAL } from '../../constants';
import LoadMore from '../../components/load-more';

function TabReviewComments({ theUser }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [comments, setComments] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            if (theUser) {
                try {
                    setIsLoading(true);
                    const res = await fetch(`/api/users/${theUser.id}/review-comments?skip=${skip}&limit=${limit}`);
                    if (res.ok) {
                        const json = await res.json();
                        setComments(prev => skip === 0 ? json.data : [...prev, ...json.data]);
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
            {comments?.map((comment, index) => (
                <Block key={index} display='flex' padding='scale600' flexDirection='column' marginBottom='scale300'
                    backgroundColor='backgroundSecondary'
                    overrides={{
                        Block: {
                            style: ({ $theme }) => ({
                                borderRadius: $theme.borders.radius300,
                            }),
                        }
                    }}
                >
                    {comment.review
                        ? (<LabelMedium marginBottom='scale200'>回复了 <RouterLink href={`/users/${comment.review.user.id}`} kind='underline'>{comment.review.user.name}</RouterLink> 对 <RouterLink href={`/apps/${comment.review.app.id}`} kind='underline'>{comment.review.app.name}</RouterLink> 的 <RouterLink href={`/reviews/${comment.review.id}`} kind='underline'>评测</RouterLink> </LabelMedium>)
                        : (<LabelMedium marginBottom='scale200'>回复了评测</LabelMedium>)
                    }
                    <LabelSmall color='primary500' marginTop='scale0'>{DateTime.formatCN(comment.createdAt)}</LabelSmall>
                    <Block display='flex' flexDirection='column'>
                        <ParagraphMedium marginBottom='0'>{comment.content}</ParagraphMedium>
                        <ParagraphSmall backgroundColor='backgroundTertiary' marginBottom='0' padding='scale300' color='primary200'
                            overrides={{
                                Block: {
                                    style: ({ $theme }) => ({
                                        borderRadius: $theme.borders.radius300,
                                    })
                                }
                            }}
                        >
                            {comment.review ? comment.review.content?.slice(0, 100) + (comment.review.content.length > 100 ? '...' : '') : '该评测已被删除'}
                        </ParagraphSmall>
                    </Block>
                </Block>
            ))}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='158px' onClick={() => setSkip(prev => prev + limit)} />
        </Block>
    );
}

export default TabReviewComments;