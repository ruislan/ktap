import React from 'react';
import { Block } from 'baseui/block';
import { useStyletron } from 'baseui';
import { LabelMedium } from 'baseui/typography';
import { Star } from '../../components/icons';
import Capsule from '../../components/capsule';
import { MOBILE_BREAKPOINT, PAGE_LIMIT_NORMAL } from '../../constants';
import LoadMore from '../../components/load-more';

function TabFollowUsers({ theUser }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [css, theme] = useStyletron();
    const [follows, setFollows] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            if (theUser) {
                try {
                    setIsLoading(true);
                    const res = await fetch(`/api/users/${theUser.id}/follows/apps?skip=${skip}&limit=${limit}`);
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
                <Capsule key={index} href={`/apps/${follow.app.id}`}>
                    <Block marginLeft='scale100' width='138px' height='68px'>
                        <img src={follow.app.media.head.thumbnail} className={css({ width: '100%', height: '100%', borderRadius: theme.sizing.scale100 })} />
                    </Block>
                    <Block display='flex' alignSelf='center' flexDirection='column' paddingLeft='scale600' paddingRight='scale600'
                        paddingTop='scale100' flex={1} overflow='auto'
                        overrides={{
                            Block: {
                                style: {
                                    [MOBILE_BREAKPOINT]: {
                                        paddingLeft: theme.sizing.scale300,
                                        paddingRight: theme.sizing.scale300,
                                    }
                                }
                            }
                        }}>
                        <LabelMedium marginBottom='scale100' overflow='hidden' whiteSpace='nowrap' textOverflow='ellipsis'>
                            {follow.app.name}
                        </LabelMedium>
                        <Block display='flex' alignItems='center'>
                            <LabelMedium marginRight='scale0'>{follow.app.score}</LabelMedium>
                            <Star width='20px' height='20px' />
                        </Block>
                    </Block>
                </Capsule>
            ))}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='68px' onClick={() => setSkip(prev => prev + limit)} />
        </Block>
    );
}

export default TabFollowUsers;