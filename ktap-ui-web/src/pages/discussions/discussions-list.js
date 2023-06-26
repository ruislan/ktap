import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useStyletron } from 'baseui';
import { useAuth } from '../../hooks/use-auth';
import { Block } from 'baseui/block';
import { LabelMedium, LabelSmall, LabelXSmall, } from 'baseui/typography';
import { Search } from 'baseui/icon';
import { Skeleton } from 'baseui/skeleton';
import RouterLink from '../../components/router-link';
import SplitBall from '../../components/split-ball';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import { Gift2, Message4, Pin, Reply } from '../../components/icons';
import { useNavigate } from 'react-router-dom';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

function DiscussionTopics({ appId, discussionId, }) {
    const limit = 1;
    const [css, theme] = useStyletron();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const [topics, setTopics] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    React.useEffect(() => {
        if (discussionId > 0) {
            (async () => {
                setIsLoading(true);
                try {
                    // const res = await fetch(`/api/apps/${appId}/discussions/${discussionId}/topics?limit=${limit}&skip=${skip}`);
                    // const data = await res.json();
                    setTopics([
                        { id: 1, subject: '训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记', content: '训练笔记内定', createdAt: '2022-06-20', isTop: true, ip: '101.101.101.101', meta: { comments: 372, gifts: 32, }, user: { id: 1, avatar: 'https://avatars.dicebear.com/api/adventurer-neutral/892.svg?width=285', name: '爱吃草鱼的小明明呀' }, last: { user: { id: 2, name: '哎哟喂' }, } },
                        { id: 2, subject: '训练笔记', content: '训练笔记内定', createdAt: '2023-06-20', isTop: false, ip: '101.101.101.101', meta: { comments: 30, gifts: 0 }, user: { id: 2, avatar: 'https://avatars.dicebear.com/api/adventurer-neutral/1231231.svg?width=285', name: 'admin' } },
                    ]);
                    setHasMore(true);
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, [appId, discussionId, skip]);

    return (
        <Block display='flex' flexDirection='column' width='100%' gridGap='scale300'>
            <Block display='flex' alignItems='center' justifyContent='space-between' paddingTop='scale300' paddingBottom='scale300'>
                {user ? <Button size='compact' kind='secondary'>发起新话题</Button> : <Button size='compact' kind='secondary' onClick={e => {
                    e.preventDefault();
                    navigate('/login');
                }}>登录</Button>}
                <Block display='flex' alignItems='center' gridGap='scale300'>
                    <Input size='compact' placeholder='搜索' />
                    <Button size='compact' kind='secondary'><Search /></Button>
                </Block>
            </Block>
            {topics?.length === 0 ?
                <LabelSmall marginTop='scale600' alignSelf='center' color='primary500'>无内容</LabelSmall> :
                topics.map((topic, index) => {
                    return (
                        <RouterLink key={index} href={`/discussions/apps/${appId}/topics/${topic.id}`}>
                            <Block display='flex' gridGap='scale300' width='100%' paddingTop='scale300' paddingBottom='scale300' overrides={{
                                Block: {
                                    style: {
                                        borderBottomColor: theme.borders.border100.borderColor,
                                        borderBottomWidth: theme.borders.border100.borderWidth,
                                        borderBottomStyle: theme.borders.border100.borderStyle,
                                    }
                                }
                            }}>
                                <img className={css({ borderRadius: theme.borders.radius300, marginTop: theme.sizing.scale0 })} src={topic?.user?.avatar} width='36px' height='36px' />
                                <Block display='flex' flexDirection='column' flex='1'>
                                    <LabelMedium marginBottom='scale200'>{topic?.subject}</LabelMedium>
                                    <Block display='flex' alignItems='center' color='primary300' flexWrap>
                                        {topic.isTop &&
                                            <>
                                                <Pin width='16px' height='16px' />
                                                <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                            </>
                                        }
                                        <LabelSmall whiteSpace='nowrap' color='inherit' display='flex' alignItems='center' gridGap='scale0'>
                                            {topic?.last?.user?.name && <Reply width='16px' height='16px' />}
                                            @{topic?.last?.user ? topic?.last?.user.name : topic?.user?.name}
                                        </LabelSmall>
                                        <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                        {topic?.meta?.comments > 0 &&
                                            <>
                                                <Block display='flex' alignItems='center' gridGap='scale0' color='inherit'>
                                                    <Message4 width='16px' height='16px' />
                                                    <LabelSmall color='inherit'>{topic?.meta?.comments || 0}</LabelSmall>
                                                </Block>
                                                <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                            </>
                                        }
                                        {topic?.meta?.gifts > 0 &&
                                            <>
                                                <Block display='flex' alignItems='center' gridGap='scale0' color='inherit'>
                                                    <Gift2 width='16px' height='16px' />
                                                    <LabelSmall color='inherit'>{topic?.meta?.gifts || 0}</LabelSmall>
                                                </Block>
                                                <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                            </>
                                        }
                                        <LabelSmall whiteSpace='nowrap' color='inherit'>{dayjs(topic?.createdAt).fromNow()}</LabelSmall>
                                    </Block>
                                </Block>
                            </Block>
                        </RouterLink>
                    );
                })
            }
            {hasMore &&
                <Block marginTop='scale800' display='flex' justifyContent='center'>
                    <Button size='default' kind='tertiary' isLoading={isLoading} onClick={() => setSkip(prev => prev + limit)}>
                        查看更多
                    </Button>
                </Block>
            }
        </Block>
    );
}

function DiscussionsList({ appId, initDiscussionId = 0, }) {
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(true);
    const [discussions, setDiscussions] = React.useState([]);
    const [discussionId, setDiscussionId] = React.useState(0);
    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                // const res = await fetch(`/api/discussions/apps/${appId}`);
                // const data = await res.json();
                const data = [
                    { id: 1, name: '综合讨论', description: 'Welcome to Teyvat, Traveler! This is the place to discuss with others about your favorite game: Genshin Impact!', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },
                    { id: 2, name: '游戏攻略', description: 'Welcome to Teyvat, Traveler! This is the place to discuss with others about your favorite game: Genshin Impact!', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },
                    { id: 3, name: '问题反馈', description: 'Welcome to Teyvat, Traveler! This is the place to discuss with others about your favorite game: Genshin Impact!', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },
                    { id: 4, name: '无聊灌水', description: 'Welcome to Teyvat, Traveler! This is the place to discuss with others about your favorite game: Genshin Impact!', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', },
                ];
                setDiscussions(data);
                initDiscussionId > 0 ? setDiscussionId(initDiscussionId) : setDiscussionId(data[0]?.id);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [appId, initDiscussionId]);


    return (
        <Block display='flex' flexDirection='column' gridGap='scale300' paddingTop='scale600' paddingBottom='scale600'>
            {isLoading ?
                <Skeleton height='64px' width='100%' /> :
                <Block paddingBottom='scale600' overflow='scrollX' display='flex' alignItems='center' gridGap='scale300'>
                    {discussions && discussions.map((discussion, index) => {
                        return (
                            <div key={index} className={css({
                                display: 'flex', alignItems: 'center', gap: theme.sizing.scale300, overflow: 'hidden',
                                cursor: 'pointer', position: 'relative', padding: theme.sizing.scale300, minWidth: '240px',
                                backgroundColor: discussion.id === discussionId ? theme.colors.backgroundTertiary : theme.colors.backgroundSecondary,
                                borderRadius: theme.borders.radius300, textDecoration: 'none',
                                boxShadow: discussion.id === discussionId ? theme.lighting.shadow700 : 'unset',
                                ':hover': {
                                    backgroundColor: theme.colors.backgroundTertiary,
                                    boxShadow: theme.lighting.shadow700,
                                },
                            })} onClick={() => setDiscussionId(discussion.id)}>
                                <img src={discussion.icon} className={css({ objectFit: 'cover', borderRadius: theme.borders.radius300, width: theme.sizing.scale1200, height: theme.sizing.scale1200 })} alt={discussion.name} />
                                <Block display='flex' flexDirection='column' gridGap='scale100' width='calc(100% - 56px)'>
                                    <LabelSmall color={discussion.id === discussionId ? '' : 'primary100'}>{discussion.name}</LabelSmall>
                                    <LabelXSmall color={discussion.id === discussionId ? 'primary100' : 'primary300'} width='100%' whiteSpace='nowrap' overflow='hidden' textOverflow='ellipsis'>{discussion.description}</LabelXSmall>
                                </Block>
                            </div>
                        );
                    })}
                </Block>
            }
            {discussionId > 0 && <DiscussionTopics appId={appId} discussionId={discussionId} />}
        </Block >
    );
}

export default DiscussionsList;