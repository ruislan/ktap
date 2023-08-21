import React from 'react';

import { Block } from 'baseui/block';
import { Checkbox } from 'baseui/checkbox';
import { HeadingSmall, LabelLarge } from 'baseui/typography';

import Notification from '@ktap/components/notification';
import { Button } from 'baseui/button';

export default function SettingsNotifications() {
    const [tip, setTip] = React.useState(null);
    const [form, setForm] = React.useState({
        followingUserChanged: false, followingAppChanged: false,
        reactionReplied: false, reactionThumbed: false, reactionGiftSent: false,
    });

    return (
        <Block display='flex' flexDirection='column'
            justifyContent='flex-start' overrides={{
                Block: {
                    style: {
                        overflowWrap: 'break-word',
                    }
                }
            }}>
            <HeadingSmall marginTop='0' marginBottom='scale600'>通知</HeadingSmall>
            {tip && <Notification kind={tip.kind} message={tip.message} />}

            <Block display='flex' flexDirection='column' marginBottom='scale600'>
                <LabelLarge marginTop='0' marginBottom='scale300'>关注通知</LabelLarge>
                <Block display='flex' flexDirection='column' gridGap='scale200'>
                    <Checkbox onChange={e => setForm(prev => ({ ...prev, followingAppChanged: e.target.checked }))} checked={form.followingAppChanged}>我关注的游戏有了新的新闻、事件等，给我发送通知</Checkbox>
                    <Checkbox onChange={e => setForm(prev => ({ ...prev, followingUserChanged: e.target.checked }))} checked={form.followingUserChanged}>我关注的用户有了新的评测、回复、讨论等，给我发送通知</Checkbox>
                </Block>
            </Block>

            <Block display='flex' flexDirection='column' marginBottom='scale600'>
                <LabelLarge marginTop='0' marginBottom='scale300'>反馈通知</LabelLarge>
                <Block display='flex' flexDirection='column' gridGap='scale200'>
                    <Checkbox onChange={e => setForm(prev => ({ ...prev, reactionReplied: e.target.checked }))} checked={form.reactionReplied}>有人回复了我的评论和讨论，给我发送通知</Checkbox>
                    <Checkbox onChange={e => setForm(prev => ({ ...prev, reactionThumbed: e.target.checked }))} checked={form.reactionThumbed}>有人赞了我的评论和讨论，给我发送通知</Checkbox>
                    <Checkbox onChange={e => setForm(prev => ({ ...prev, reactionGiftSent: e.target.checked }))} checked={form.reactionGiftSent}>有人赏了礼物给我的评论和讨论，给我发送通知</Checkbox>
                </Block>
            </Block>

            <Block display='flex' alignItems='center'>
                <Button $size='compact' $kind='secondary'>保存</Button>
            </Block>
        </Block>
    );
}