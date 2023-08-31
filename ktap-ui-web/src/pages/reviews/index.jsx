import React from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { Block } from 'baseui/block';

import { MOBILE_BREAKPOINT, LAYOUT_DEFAULT_CONTENT, LAYOUT_DEFAULT_SIDE } from '@ktap/libs/utils';
import ReviewBox from '@ktap/components/review-box';

import ReviewAppGlance from './review-app-glance';
import ReviewTopBar from './review-top-bar';

function Reviews() {
    const navigate = useNavigate();
    const { id, commentId } = useParams();
    const [review, setReview] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(true);

    const fetchReview = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(commentId > 0 ? `/api/reviews/${id}?commentIds=${commentId}` : `/api/reviews/${id}`);
            if (res.ok) {
                const json = await res.json();
                const effectRes = await fetch(`/api/user/effect/reviews?ids=${id}`);
                if (effectRes.ok) {
                    const effectJson = await effectRes.json();
                    json.data.viewer = {
                        direction: effectJson.data[id].thumb,
                        reported: effectJson.data[id].reported
                    }
                }
                setReview(json.data);
            } else {
                throw { status: res.status };
            }
        } catch (error) {
            if (error?.status === 404) navigate('/not-found', { replace: true });
            else navigate('/not-work');
        } finally {
            setIsLoading(false);
        }
    }, [id, commentId, navigate]);

    React.useEffect(() => {
        fetchReview();
    }, [fetchReview]);

    if (isLoading) return <></>;

    return (
        <Block marginTop='scale900' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    [MOBILE_BREAKPOINT]: {
                        marginTop: $theme.sizing.scale600,
                        width: '100%',
                    }
                })
            }
        }}>
            <ReviewTopBar user={review.user} score={review.score} />

            <Block paddingLeft='scale300' paddingRight='scale300' paddingTop='scale100'>
                <Block overrides={{
                    Block: {
                        style: {
                            display: 'flex',
                            justifyContent: 'center',
                            [MOBILE_BREAKPOINT]: {
                                display: 'grid'
                            },
                        }
                    }
                }}>
                    <Block width={LAYOUT_DEFAULT_CONTENT} marginRight='scale300' overrides={{
                        Block: {
                            style: {
                                [MOBILE_BREAKPOINT]: {
                                    width: '100%', paddingLeft: 0, paddingRight: 0, margin: '0',
                                    gridArea: '2 / 1',
                                }
                            }
                        }
                    }} >
                        {commentId > 0 ?
                            <ReviewBox review={review} include={{ comments: { summary: true } }} /> :
                            <ReviewBox review={review} editable include={{ actions: { report: true }, comments: { list: true } }} afterUpdated={() => fetchReview()} />
                        }
                    </Block>
                    <Block width={LAYOUT_DEFAULT_SIDE} marginBottom='scale600' marginLeft='scale300' overrides={{
                        Block: {
                            style: {
                                [MOBILE_BREAKPOINT]: { marginLeft: 0, width: '100%', },
                            }
                        }
                    }}>
                        <ReviewAppGlance app={review.app} />
                    </Block>
                </Block>
            </Block>
        </Block>
    );
}

export default Reviews;