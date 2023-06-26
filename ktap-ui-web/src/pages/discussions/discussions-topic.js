import React from 'react';
import dayjs from 'dayjs';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { LAYOUT_LEFT, LAYOUT_MAIN, LAYOUT_RIGHT, MOBILE_BREAKPOINT } from '../../constants';
import RouterLink from '../../components/router-link';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LabelSmall, LabelMedium, HeadingXSmall } from 'baseui/typography';
import { Message4, Star } from '../../components/icons';
import SideBox from '../../components/side-box';
import { Skeleton } from 'baseui/skeleton';

function AppGlance({ app }) {
    const [css, theme] = useStyletron();
    const navigate = useNavigate();
    return (
        <SideBox>
            <Block width='100%' maxHeight='168px' overflow='hidden'>
                <img width='100%' className={css({ borderRadius: theme.borders.radius300 })} src={app.media?.head?.image}></img>
            </Block>
            <Block display='flex' justifyContent='space-between' alignItems='center' padding='scale600'>
                <Block display='flex' alignItems='center'>
                    <Block display='flex' flexDirection='column'>
                        <LabelMedium marginBottom='scale100' overrides={{
                            Block: {
                                style: {
                                    inlineSize: '168px',
                                    whiteSpace: 'break-spaces',
                                }
                            }
                        }}>{app.name}</LabelMedium>
                        <Block display='flex' alignItems='center' justifyContent='flex-start'>
                            <Block marginRight='scale0' font='font300'>{app.score}</Block>
                            <Star width='20px' height='20px' />
                        </Block>
                    </Block>
                </Block>
                <Block>
                    <Button kind='secondary' onClick={() => navigate(`/apps/${app.id}`)}>详情</Button>
                </Block>
            </Block>
        </SideBox>
    );
}

function TopicMeta({ topic }) {
    return (
        <SideBox title='话题信息'>
            <Block display='flex' flexDirection='column' paddingTop='0' paddingLeft='scale600' paddingRight='scale600' paddingBottom='scale600'>
                <Block display='grid' gridTemplateColumns='1fr 3fr' gridGap='scale300'>
                    <LabelSmall color='primary200'>发布日期</LabelSmall>
                    <LabelSmall color='primary'>{dayjs(topic.createdAt).format('YYYY-MM-DD HH:ss')}</LabelSmall>
                    <LabelSmall color='primary200'>贴子总数</LabelSmall>
                    <LabelSmall color='primary'>{12100}</LabelSmall>
                    <LabelSmall color='primary200'>参与人数</LabelSmall>
                    <LabelSmall color='primary'>{43212}</LabelSmall>
                </Block>
                <Block display='flex' alignItems='center' width='100%' marginTop='scale600'>
                    <Button kind='secondary' onClick={() => { }}>回复</Button>
                </Block>
            </Block>
        </SideBox>
    );
}

function OtherTopics({ topic, appId }) {
    const [css, theme] = useStyletron();
    const [topics, setTopics] = React.useState([]);
    const [isLoading, setLoading] = React.useState(true);
    React.useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                // const response = await fetch(`/api/apps/${appId}/topics?limit=5&offset=0`);
                // const data = await response.json();
                // setTopics(data.data);
                setTopics([
                    { id: 1, subject: 'Mac 有闪退现象哟有闪退现象哟有闪退现象哟', meta: { posts: 32 } },
                    { id: 2, subject: 'Mac 有闪退现象哟有闪退现象哟有闪退现象哟', meta: { posts: 152 } },
                    { id: 3, subject: 'Mac 有闪退现象哟有闪退现象哟有闪退现象哟', meta: { posts: 332 } },
                    { id: 4, subject: 'Mac 有闪退现象哟有闪退现象哟有闪退现象哟', meta: { posts: 34 } },
                ]);
            } finally {
                setLoading(false);
            }
        })();
    }, [topic.id]);
    return (
        <SideBox title='其他主题'>
            <Block display='flex' flexDirection='column' gridGap='scale100' paddingLeft='scale300' paddingRight='scale300' paddingBottom='scale600'>
                {isLoading ?
                    [...Array(3)].map((_, index) => (<Skeleton key={index} width='100%' height='32px' animation />)) :
                    topics.map((t, index) => (
                        <Link key={index} to={`/discussions/apps/${appId}/topics/${t.id}`} className={css({
                            textDecoration: 'none', display: 'flex', gap: theme.sizing.scale300, alignItems: 'center', justifyContent: 'space-between',
                            padding: theme.sizing.scale300, borderRadius: theme.borders.radius200, color: 'inherit',
                            backgroundColor: 'rgba(109, 109, 109, 0.1)',
                            cursor: 'pointer',
                            ':hover': {
                                backgroundColor: 'rgba(109, 109, 109, 0.3)',
                            },
                        })}>
                            <LabelSmall color='primary100' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>{t.subject}</LabelSmall>
                            <Block display='flex' alignItems='center' gridGap='scale100'>
                                <Message4 width='16px' height='16px' />
                                <LabelSmall color='inherit'>{t.meta.posts}</LabelSmall>
                            </Block>
                        </Link>
                    ))
                }
            </Block>
        </SideBox>
    );
}

function DiscussionsTopic() {
    const { appId, id } = useParams();
    const [, theme] = useStyletron();
    const navigate = useNavigate();

    const [topic, setTopic] = React.useState({});
    const [isLoadingTopic, setIsLoadingTopic] = React.useState(true);
    const [app, setApp] = React.useState({});
    const [isLoadingApp, setIsLoadingApp] = React.useState(true);

    React.useEffect(() => {
        if (id > 0) {
            (async () => {
                try {
                    setIsLoadingTopic(true);
                    setTopic({
                        id: 1, subject: 'Mac 有闪退现象哟有闪退现象哟有闪退现象哟有闪退现象哟有闪退现象哟有闪退现象哟', isSticky: false, isClosed: false, discussion: { id: 1, name: '综合讨论' }, user: { id: 1, name: '小明', avatar: 'https://avatars.dicebear.com/api/adventurer-neutral/1231231.svg?width=285' }, createdAt: '2023-01-01', updatedAt: '2023-01-01',
                        posts: [
                            { id: 1, content: '有没有人和我一样呀', ip: '192.168.0.1', createdAt: '2021-01-01', user: { id: 1, name: '小明', avatar: 'https://avatars.dicebear.com/api/adventurer-neutral/1231231.svg?width=285' } },
                            { id: 2, content: '发给我看看嗯', ip: '192.168.0.1', createdAt: '2021-01-01', user: { id: 1, name: '小明', avatar: 'https://avatars.dicebear.com/api/adventurer-neutral/1231231.svg?width=285' } },
                            { id: 3, content: '你说是就是呀', ip: '192.168.0.1', createdAt: '2021-01-01', user: { id: 1, name: '小明', avatar: 'https://avatars.dicebear.com/api/adventurer-neutral/1231231.svg?width=285' } },
                        ]
                    });
                } finally {
                    setIsLoadingTopic(false);
                }
            })();
        }
    }, [id]);

    React.useEffect(() => {
        (async () => {
            setIsLoadingApp(true);
            try {
                const res = await fetch(`/api/apps/${appId}/basic`);
                if (res.ok) {
                    const json = await res.json();
                    setApp(json.data);
                } else {
                    if (res.status === 404) navigate('/not-found', { replace: true });
                    if (res.status >= 500) navigate('/panic');
                }
            } finally {
                setIsLoadingApp(false);
            }
        })();
    }, [appId, navigate]);

    return (
        <Block display='flex' flexDirection='column' width={LAYOUT_MAIN} marginTop='scale900' overrides={{
            Block: {
                style: {
                    [MOBILE_BREAKPOINT]: {
                        width: '100%',
                        marginTop: theme.sizing.scale600, marginLeft: theme.sizing.scale300, marginRight: theme.sizing.scale300,
                    }
                }
            }
        }}>
            <Block display='flex' width='100%' alignItems='center' gridGap='scale300' marginBottom='scale800'>
                <RouterLink href={`/apps/${appId}`} kind='underline'><LabelSmall>{app?.name}</LabelSmall></RouterLink> /
                <RouterLink href={`/discussions/apps/${appId}`} kind='underline'><LabelSmall>{topic?.discussion?.name}</LabelSmall></RouterLink> /
                <LabelSmall>话题详情</LabelSmall>
            </Block>
            <Block display='flex' width='100%' flexDirection='column' backgroundColor='backgroundSecondary' padding='scale700' marginBottom='scale800' overrides={{
                Block: { style: { borderRadius: theme.borders.radius300, boxShadow: theme.lighting.shadow500, } }
            }}>
                <HeadingXSmall margin='0'>{topic.subject}</HeadingXSmall>
                {/* <Block marginTop='scale600'>
                            <LabelSmall>{topic?.user?.name}</LabelSmall>
                        </Block> */}
            </Block>
            <Block display='flex' width='100%'>
                <Block display='flex' flexDirection='column' width={LAYOUT_LEFT} marginRight='scale300'>

                </Block>
                <Block display='flex' flexDirection='column' width={LAYOUT_RIGHT} marginLeft='scale300'>
                    {!isLoadingTopic && <TopicMeta topic={topic} />}
                    {!isLoadingApp && <AppGlance app={app} />}
                    {!isLoadingTopic && <OtherTopics appId={appId} topic={topic} />}
                </Block>
            </Block>
        </Block>
    );
}

export default DiscussionsTopic;