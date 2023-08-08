import React from 'react';

import { Block } from 'baseui/block';

import { PAGE_LIMIT_NORMAL, } from '../../constants';
import { useAuth } from '../../hooks/use-auth';
import LoadMore from '../../components/load-more';
import ReviewBox from '../../components/review-box';

function TabReviews({ theUser }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [reviews, setReviews] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const { user } = useAuth();

    React.useEffect(() => {
        (async () => {
            if (theUser) {
                try {
                    setIsLoading(true);
                    const res = await fetch(`/api/users/${theUser.id}/reviews?skip=${skip}&limit=${limit}`);
                    if (res.ok) {
                        const json = await res.json();
                        if (user && json.data && json.data.length > 0) {
                            const thumbRes = await fetch(`/api/user/effect/reviews/thumbs?ids=${json.data.map(v => v.id).join(',')}`);
                            if (thumbRes.ok) {
                                const thumbJson = await thumbRes.json();
                                json.data.forEach(review => review.viewer = { direction: thumbJson.data[review.id] });
                            }
                        }
                        setReviews(prev => skip === 0 ? json.data : [...prev, ...json.data]);
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
            {reviews?.map((review, index) => <ReviewBox key={index} review={review} include={{ header: true, app: true, comments: true }} />)}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='380px' onClick={() => setSkip(prev => prev + limit)} />
        </Block>
    );
}

export default TabReviews;