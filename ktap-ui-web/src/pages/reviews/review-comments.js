import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { LabelMedium, LabelSmall, LabelXSmall, ParagraphSmall } from 'baseui/typography';
import { Input } from "baseui/input";
import { ArrowUp } from 'baseui/icon';
import AvatarSquare from '../../components/avatar-square';
import { useAuth } from '../../hooks/use-auth';
import { TrashBin } from '../../components/icons';
import Buzzword from '../../components/buzzword';
import { useNavigate } from 'react-router-dom';
import RouterLink from '../../components/router-link';
import { Skeleton } from 'baseui/skeleton';
import { PAGE_LIMIT_NORMAL } from '../../constants';

function ReviewComments({ review }) {
    const limit = PAGE_LIMIT_NORMAL;
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = React.useState(true);
    const [comments, setComments] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const [commentContent, setCommentContent] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitErrorMessage, setSubmitErrorMessage] = React.useState(null);
    const [buzzwords, setBuzzwords] = React.useState([]);
    const [count, setCount] = React.useState(review?.meta.comments);

    const handleSubmitComment = async () => {
        if (!user) { navigate('/login'); return; }
        if (commentContent && commentContent.length > 0) {
            try {
                setSubmitErrorMessage(null);
                setIsSubmitting(true);
                const res = await fetch(`/api/reviews/${review.id}/comments`, { body: JSON.stringify({ content: commentContent }), method: 'POST', headers: { 'content-type': 'application/json' } });
                if (res.ok) {
                    const json = await res.json();
                    setCommentContent('');
                    json.data.user = user;
                    setComments(prev => [json.data, ...prev]);
                    setCount(prev => prev + 1);
                }
            } catch {
                setSubmitErrorMessage('抱歉，发生了某种错误，请稍后再试。');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleDeleteComment = async (comment) => {
        if (!user) { navigate('/login'); return; }
        if (comment && comment.id) {
            const res = await fetch(`/api/reviews/${review.id}/comments/${comment.id}`, { method: "DELETE" });
            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== comment.id));
                setCount(prev => prev - 1);
            }
        }
    };

    const fetchComments = React.useCallback(async () => {
        if (!review?.id) return;
        try {
            setIsLoading(true);
            const res = await fetch(`/api/reviews/${review.id}/comments?skip=${skip}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                setComments(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                setHasMore(json.skip + limit < json.count);
                setCount(json.count);
            }
        } finally {
            setIsLoading(false);
        }
    }, [review, skip, limit]);

    React.useEffect(() => {
        dayjs.locale('zh-cn');
        dayjs.extend(relativeTime);

        (async () => {
            const res = await fetch('/api/buzzwords?limit=15');
            if (res.ok) {
                const json = await res.json();
                setBuzzwords(json.data);
            }
        })();
    }, []);

    React.useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    return (
        <>
            {/* 回复输入框 */}
            <Block paddingTop='scale600' paddingBottom='scale600' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        borderStyle: 'solid',
                        borderColor: $theme.borders.border200.borderColor,
                        borderTopWidth: '0',
                        borderBottomWidth: '1px',
                        borderLeftWidth: '0',
                        borderRightWidth: '0',
                    })
                }
            }}>
                <Block display='flex' alignItems='center'>
                    <Block marginRight='scale300'>
                        <AvatarSquare size='scale1000' src={review.user.avatar} />
                    </Block>
                    <Block overrides={{
                        Block: {
                            style: {
                                flexGrow: 1,
                            }
                        }
                    }}>
                        <Input maxLength='1000' disabled={isSubmitting || !review.allowComment} value={commentContent} onChange={e => setCommentContent(e.target.value)}
                            placeholder={review.allowComment ? '添加回复' : '该评测已关闭回复'}
                            endEnhancer={() =>
                                commentContent &&
                                <Block marginRight={'-8px'}>
                                    <Button onClick={() => handleSubmitComment()} disabled={!commentContent || isSubmitting || !review.allowComment} kind='primary' shape='circle' size='mini'>
                                        <ArrowUp size={16} />
                                    </Button>
                                </Block>}
                        />
                    </Block>
                </Block>
                <Block display='flex' marginTop='scale300' alignItems='center' justifyContent='flex-end'>
                    {submitErrorMessage && <LabelSmall marginRight='scale300' color='negative'>{submitErrorMessage}</LabelSmall>}
                </Block>
                <Block display='flex' flexWrap='wrap' marginTop='scale300' alignItems='center'>
                    {buzzwords && buzzwords.map(({ content }, index) => <Buzzword key={index} onClick={() => setCommentContent(content)}>{content}</Buzzword>)}
                </Block>
            </Block>
            <Block paddingTop='scale600' paddingBottom='scale600'>
                <LabelMedium color='primary100' marginBottom='scale300'>回复 ({count})</LabelMedium>
                {comments?.map((comment, index) => (
                    <Block key={index} display='flex' alignItems='center' paddingTop='scale300' paddingBottom='scale300'>
                        <Block marginRight='scale300' alignSelf='flex-start'>
                            <AvatarSquare size='scale1000' src={comment.user.avatar} />
                        </Block>
                        <Block display='flex' flex='1' flexDirection='column'>
                            <Block display='flex'>
                                <LabelSmall marginRight='scale300' overrides={{
                                    Block: {
                                        style: {
                                            fontWeight: 'bold',
                                        }
                                    }
                                }}>
                                    <RouterLink href={`/users/${review.user.id}`}>{comment.user.name}</RouterLink>
                                </LabelSmall>
                                <LabelXSmall color='primary400'>{dayjs(comment.createdAt).fromNow()}</LabelXSmall>
                            </Block>
                            <ParagraphSmall marginTop='scale200' marginBottom='0' color='primary100'>{comment.content}</ParagraphSmall>
                        </Block>
                        {user?.id === comment.user.id &&
                            <Block alignSelf='flex-start' marginLeft='scale300'>
                                <Button kind='tertiary' size='mini' shape='circle' onClick={() => handleDeleteComment(comment)}>
                                    <TrashBin width='16px' height='16px' color='#a3a3a3' />
                                </Button>
                            </Block>
                        }
                    </Block>
                ))}
                {isLoading && <Block display='flex' flexDirection='column' marginTop='scale300' marginBottom='scale300' gridGap='scale300' justifyContent='center'>
                    <Skeleton animation height='58px' width='100%' />
                    <Skeleton animation height='58px' width='100%' />
                    <Skeleton animation height='58px' width='100%' />
                </Block>}
                {hasMore && !isLoading &&
                    <Block marginTop='scale800' display='flex' justifyContent='center'>
                        <Button size='default' kind='tertiary' onClick={() => setSkip(prev => prev + limit)}>
                            查看更多
                        </Button>
                    </Block>
                }
            </Block>
        </>
    );
}

export default ReviewComments;