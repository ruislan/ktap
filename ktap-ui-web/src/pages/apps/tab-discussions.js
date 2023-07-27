import React from 'react';
import dayjs from 'dayjs';
import { useStyletron } from 'baseui';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { LabelLarge, LabelMedium, LabelSmall } from 'baseui/typography';
import SplitBall from '../../components/split-ball';
import { Gift2, Message4, Pin, Reply } from '../../components/icons';
import RouterLink from '../../components/router-link';
import { Skeleton } from 'baseui/skeleton';
import { PAGE_LIMIT_NORMAL } from '../../constants';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

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
            {discussions?.map((discussion, index) => {
                return (
                    <RouterLink key={index} href={`/discussions/${discussion.id}`} >
                        <Block display='flex' gridGap='scale300' width='100%' paddingTop='scale400' paddingBottom='scale400' overrides={{
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
                                            <Pin width='16px' height='16px' />
                                            <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                        </>
                                    }
                                    <LabelSmall whiteSpace='nowrap' color='inherit' display='flex' alignItems='center' gridGap='scale0'>
                                        {discussion?.last?.user?.name && <Reply width='16px' height='16px' />}
                                        @{discussion?.last?.user ? discussion?.last?.user.name : discussion?.user?.name}
                                    </LabelSmall>
                                    <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                    {discussion?.meta?.posts > 0 &&
                                        <>
                                            <Block display='flex' alignItems='center' gridGap='scale0' color='inherit'>
                                                <Message4 width='16px' height='16px' />
                                                <LabelSmall color='inherit'>{discussion?.meta?.posts || 0}</LabelSmall>
                                            </Block>
                                            <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                        </>
                                    }
                                    {discussion?.meta?.gifts > 0 &&
                                        <>
                                            <Block display='flex' alignItems='center' gridGap='scale0' color='inherit'>
                                                <Gift2 width='16px' height='16px' />
                                                <LabelSmall color='inherit'>{discussion?.meta?.gifts || 0}</LabelSmall>
                                            </Block>
                                            <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                        </>
                                    }
                                    <LabelSmall whiteSpace='nowrap' color='inherit'>{dayjs(discussion?.createdAt).fromNow()}</LabelSmall>
                                </Block>
                            </Block>
                        </Block>
                    </RouterLink>
                );
            })}
            {isLoading && <Block display='flex' flexDirection='column' gridGap='scale300' justifyContent='center'>
                <Skeleton animation height='56px' width='100%' />
                <Skeleton animation height='56px' width='100%' />
                <Skeleton animation height='56px' width='100%' />
            </Block>}
            {hasMore && !isLoading &&
                <Block marginTop='scale600' display='flex' justifyContent='center' alignItems='center'>
                    <Button onClick={() => setSkip(prev => prev + limit)} kind='tertiary'>查看更多</Button>
                </Block>
            }
        </Block >
    );
}
export default TabDiscussions;