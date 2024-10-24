import React from 'react';

import { Block } from 'baseui/block';
import { LabelLarge, LabelXSmall } from 'baseui/typography';

import AvatarSquare from '@ktap/components/avatar-square';
import Capsule from '@ktap/components/capsule';
import GenderLabel from '@ktap/components/gender-label';
import { PAGE_LIMIT_NORMAL } from '@ktap/libs/utils';
import LoadMore from '@ktap/components/load-more';

function TabFollowUsers({ theUser }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [follows, setFollows] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            if (theUser) {
                try {
                    setIsLoading(true);
                    const res = await fetch(`/api/users/${theUser.id}/follows/users?skip=${skip}&limit=${limit}`);
                    if (res.ok) {
                        const json = await res.json();
                        setFollows(prev => skip === 0 ? json.data : [...prev, ...json.data]);
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
            {follows?.map((follow, index) => (
                <Capsule key={index} href={`/users/${follow.user.id}`}>
                    <Block display='flex' alignItems='center'>
                        <Block display='flex' alignItems='center' marginLeft='scale100'><AvatarSquare src={follow.user.avatar} size='scale1600' /></Block>
                        <Block display='flex' flexDirection='column' marginLeft='scale300'>
                            <Block display='flex' alignItems='center' marginBottom='scale100'>
                                <LabelLarge marginRight='scale100'>{follow.user.name}</LabelLarge>
                                <GenderLabel gender={follow.user.gender} />
                            </Block>
                            <LabelXSmall color='primary100' marginRight='scale100'>{follow.user?.title}</LabelXSmall>
                        </Block>
                    </Block>
                </Capsule>
            ))}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='68px' onClick={() => setSkip(prev => prev + limit)} />
        </Block>
    );
}

export default TabFollowUsers;