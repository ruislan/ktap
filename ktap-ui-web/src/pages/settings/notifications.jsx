import React from 'react';

import { Block } from 'baseui/block';
import { Checkbox } from 'baseui/checkbox';
import { Spinner } from 'baseui/spinner';
import { HeadingSmall, LabelLarge } from 'baseui/typography';
import { Button } from 'baseui/button';

import Notification from '@ktap/components/notification';
import { Messages } from '@ktap/libs/utils';

function Form({ initData }) {
    const [tip, setTip] = React.useState(null);
    const [form, setForm] = React.useState({ ...initData });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const save = async () => {
        try {
            setIsSubmitting(true);
            const res = await fetch('/api/settings/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form })
            });
            if (res.ok) {
                setTip({ kind: 'positive', message: Messages.updated });
            } else {
                const json = await res.json();
                if (res.status === 401 || res.status === 403) {
                    setTip({ kind: 'negative', message: Messages.noPermission });
                } else {
                    throw new Error(json.message);
                }
            }
        } catch (e) {
            setTip({ kind: 'negative', message: Messages.unknownError });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <>
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
                <Button $isLoading={isSubmitting} $size='compact' $kind='secondary' onClick={() => save()}>保存</Button>
            </Block>
        </>
    );
}

export default function SettingsNotifications() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [initData, setInitData] = React.useState(null);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/settings/notifications', { headers: { 'Content-Type': 'application/json' } });
                if (res.ok) {
                    const json = await res.json();
                    setInitData({ ...json.data });
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    return (
        <Block display='flex' flexDirection='column' justifyContent='flex-start'>
            <HeadingSmall marginTop='0' marginBottom='scale600'>通知</HeadingSmall>
            {
                isLoading ?
                    <Block minHeight='20vh' display='flex' justifyContent='center' alignItems='center'><Spinner $size='scale1600' $borderWidth='scale300' $color='primary' /></Block> :
                    <Form initData={initData} />
            }

        </Block>
    );
}