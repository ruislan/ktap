import React from 'react';
import dayjs from 'dayjs';
import { useStyletron } from 'baseui';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Block } from 'baseui/block';
import { LabelLarge, LabelMedium, LabelSmall } from 'baseui/typography';
import SplitBall from '../../components/split-ball';
import { Gift2, Message4, Pin, Reply } from '../../components/icons';
import RouterLink from '../../components/router-link';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

// TODO 这里可以做成最新的讨论列表，不需要集成那边的，如果要参与讨论，主战场在那边。
function TabDiscussions({ appId }) {
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(false);
    const [discussions, setDiscussions] = React.useState([]);

    React.useEffect(() => {
        // load discussions
        (async () => {
            setIsLoading(true);
            try {
                setDiscussions([
                    { id: 1, subject: '训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记训练笔记', content: '训练笔记内定', createdAt: '2022-06-20', isTop: true,  channel: {id: 1, name: '综合讨论'}, meta: { comments: 372, gifts: 32, }, user: { id: 1, avatar: 'https://avatars.dicebear.com/api/adventurer-neutral/892.svg?width=285', name: '爱吃草鱼的小明明呀' }, last: { user: { id: 2, name: '哎哟喂' }, } },
                    { id: 2, subject: '训练笔记', content: '训练笔记内定', createdAt: '2023-06-20', isTop: false, channel: {id: 1, name: '灌水'}, meta: { comments: 30, gifts: 0 }, user: { id: 2, avatar: 'https://avatars.dicebear.com/api/adventurer-neutral/1231231.svg?width=285', name: 'admin' } },
                ]);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [appId]);
    return (
        <Block paddingTop='scale600' paddingBottom='scale600'>
            <Block display='flex' alignItems='center' justifyContent='space-between' paddingTop='scale300' paddingBottom='scale300'>
                <LabelLarge>最新话题</LabelLarge>
                <RouterLink href={`/discussions/apps/${appId}`}><LabelSmall>查看全部</LabelSmall></RouterLink>
            </Block>
            {isLoading ?
                <Skeleton width="100%" height="150px" animation /> :
                (discussions.length === 0 ?
                    <LabelMedium color='primary500'>无话题</LabelMedium> :
                    discussions.map((discussion, index) => {
                        return (
                            <RouterLink key={index} href={`/discussions/apps/${appId}/view/${discussion.id}`} >
                                <Block display='flex' gridGap='scale300' width='100%' paddingTop='scale300' paddingBottom='scale300' overrides={{
                                    Block: {
                                        style: {
                                            borderBottomColor: theme.borders.border300.borderColor,
                                            borderBottomWidth: theme.borders.border300.borderWidth,
                                            borderBottomStyle: theme.borders.border300.borderStyle,
                                        }
                                    }
                                }}>
                                    <img className={css({ borderRadius: theme.borders.radius300, marginTop: theme.sizing.scale0 })} src={discussion?.user?.avatar} width='36px' height='36px' />
                                    <Block display='flex' flexDirection='column' flex='1'>
                                        <LabelMedium marginBottom='scale200'>{discussion?.subject}</LabelMedium>
                                        <Block display='flex' alignItems='center' color='primary300' flexWrap>
                                            <LabelSmall whiteSpace='nowrap' color='inherit'>{discussion?.channel?.name}</LabelSmall>
                                            <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                            {discussion.isTop &&
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
                                            {discussion?.meta?.comments > 0 &&
                                                <>
                                                    <Block display='flex' alignItems='center' gridGap='scale0' color='inherit'>
                                                        <Message4 width='16px' height='16px' />
                                                        <LabelSmall color='inherit'>{discussion?.meta?.comments || 0}</LabelSmall>
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
                    })
                )
            }
        </Block >
    );
}
export default TabDiscussions;