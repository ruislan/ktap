import React from 'react';

import { PAGE_LIMIT_NORMAL, } from '@ktap/libs/utils';
import { useAuth } from '@ktap/hooks/use-auth';
import LoadMore from '@ktap/components/load-more';
import ReviewBox from '@ktap/components/review-box';

function TabReviewsUsersList({ app }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [reviews, setReviews] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const { user } = useAuth();

    React.useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/apps/${app.id}/reviews?skip=${skip}&limit=${limit}`);
                if (res.ok) {
                    const json = await res.json();

                    if (user && json.data && json.data.length > 0) {
                        const effectRes = await fetch(`/api/user/effect/reviews?ids=${json.data.map(v => v.id).join(',')}`);
                        const effectJson = await effectRes.json();
                        json.data.forEach(review => review.viewer = { direction: effectJson.data[review.id].thumb, reported: effectJson.data[review.id].reported });
                    }
                    setReviews(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                    setHasMore(json.skip + json.limit < json.count);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [app.id, skip, limit, user]);

    return (
        <>
            {reviews?.map((review, index) => <ReviewBox key={index} review={review} include={{ header: true, user: true, comments: { summary: true } }} />)}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='400px' onClick={() => setSkip(prev => prev + limit)} />
        </>
    );
}
export default TabReviewsUsersList;