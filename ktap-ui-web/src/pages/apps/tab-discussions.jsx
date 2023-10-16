import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelLarge, LabelMedium, LabelSmall } from 'baseui/typography';

import { DateTime, PAGE_LIMIT_NORMAL } from '@ktap/libs/utils';
import SplitBall from '@ktap/components/split-ball';
import { Gift2, Icon, Message4, Pin, Reply } from '@ktap/components/icons';
import RouterLink from '@ktap/components/router-link';
import LoadMore from '@ktap/components/load-more';

function TabDiscussions({ appId }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(true);
    const [discussions, setDiscussions] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/apps/${appId}/discussions?skip=${skip}&limit=${limit}`);
                if (res.ok) {
                    const json = await res.json();
                    setDiscussions(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                    setHasMore(json.skip + json.limit < json.count);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [appId, skip, limit]);

    return (
        <Block paddingTop='scale600' paddingBottom='scale600'>
            <Block display='flex' alignItems='center' justifyContent='space-between' paddingTop='scale300' paddingBottom='scale300'>
                <LabelLarge>最新讨论</LabelLarge>
                <RouterLink href={`/discussions/apps/${appId}`}><LabelSmall>查看全部</LabelSmall></RouterLink>
            </Block>
            {discussions?.map((discussion, index) =>
                <RouterLink key={index} href={`/discussions/${discussion.id}`}>
                    <Block display='flex' gridGap='scale300' paddingTop='scale400' paddingBottom='scale400' overrides={{
                        Block: {
                            style: {
                                borderBottomColor: theme.borders.border300.borderColor,
                                borderBottomWidth: theme.borders.border300.borderWidth,
                                borderBottomStyle: theme.borders.border300.borderStyle,
                            }
                        }
                    }}>
                        <img className={css({ borderRadius: theme.borders.radius300, marginTop: theme.sizing.scale0 })} src={discussion?.user?.avatar} width='36px' height='36px' />
                        <Block display='flex' flexDirection='column' overflow='hidden'>
                            <LabelMedium marginBottom='scale200'>{discussion?.title}</LabelMedium>
                            <Block display='flex' alignItems='center' color='primary300' flexWrap>
                                <LabelSmall whiteSpace='nowrap' color='inherit'>{discussion?.channel?.name}</LabelSmall>
                                <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                {discussion.isSticky &&
                                    <>
                                        <Icon><Pin /></Icon>
                                        <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                    </>
                                }
                                <LabelSmall whiteSpace='nowrap' color='inherit' display='flex' alignItems='center' gridGap='scale0'>
                                    {discussion?.last?.user?.name && <Icon><Reply /></Icon>}
                                    @{discussion?.last?.user ? discussion?.last?.user.name : discussion?.user?.name}
                                </LabelSmall>
                                <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                {discussion?.meta?.posts > 0 &&
                                    <>
                                        <Block display='flex' alignItems='center' gridGap='scale0' color='inherit'>
                                            <Icon><Message4 /></Icon>
                                            <LabelSmall color='inherit'>{discussion?.meta?.posts || 0}</LabelSmall>
                                        </Block>
                                        <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                    </>
                                }
                                {discussion?.meta?.gifts > 0 &&
                                    <>
                                        <Block display='flex' alignItems='center' gridGap='scale0' color='inherit'>
                                            <Icon><Gift2/></Icon>
                                            <LabelSmall color='inherit'>{discussion?.meta?.gifts || 0}</LabelSmall>
                                        </Block>
                                        <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                    </>
                                }
                                <LabelSmall whiteSpace='nowrap' color='inherit'>{DateTime.fromNow(discussion?.updatedAt)}</LabelSmall>
                            </Block>
                        </Block>
                    </Block>
                </RouterLink>
            )}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='56px' onClick={() => setSkip(prev => prev + limit)} />
        </Block >
    );
}
export default TabDiscussions;