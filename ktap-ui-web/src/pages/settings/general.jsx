import React from 'react';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { FormControl } from "baseui/form-control";
import { Input } from 'baseui/input';
import { HeadingSmall, LabelSmall } from 'baseui/typography';

import { Messages } from '@ktap/libs/utils';
import { useAuth } from '@ktap/hooks/use-auth';
import Notification from '@ktap/components/notification';

function SettingsGeneral() {
    const { user, setUser } = useAuth();
    const [form, setForm] = React.useState({
        email: user?.email || '',
        name: user?.name || '',
    });
    const [notification, setNotification] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification(null);
        setIsLoading(true);
        try {
            const res = await fetch('/api/settings/general', { method: 'PUT', body: JSON.stringify({ ...form }), headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                setUser({ ...user, ...form });
                setNotification({ kind: 'positive', message: Messages.updated });
            } else {
                const data = await res.json();
                if (res.status === 401 || res.status === 403) {
                    setNotification({ kind: 'negative', message: Messages.noPermission });
                } else {
                    throw new Error(data.message);
                }
            }
        } catch (e) {
            setNotification({ kind: 'negative', message: Messages.unknownError });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Block display='flex' flexDirection='column' justifyContent='flex-start'>
            <form onSubmit={handleSubmit}>
                <HeadingSmall marginTop='0' marginBottom='scale600'>基本信息</HeadingSmall>
                {notification && <Notification kind={notification.kind} message={notification.message} />}
                <FormControl label={<LabelSmall>用户名</LabelSmall>} caption='每30天只能修改一次'>
                    <Input
                        size='compact'
                        min='1'
                        error={form.name.length < 1 || form.name.length > 20}
                        maxLength='20'
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.currentTarget.value })}
                    />
                </FormControl>
                <FormControl label={<LabelSmall>邮箱</LabelSmall>}>
                    <Input
                        min={3}
                        maxLength='100'
                        error={form.email.length < 3 || form.email.length > 100}
                        size='compact'
                        required
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.currentTarget.value })}
                    />
                </FormControl>
                <Block marginTop='scale600'><Button isLoading={isLoading} disabled={form.name.length < 1 || form.name.length > 20 || form.email.length < 3 || form.email.length > 100} size='compact' type='submit' kind='secondary'>保存</Button></Block>
            </form>
        </Block>
    );
}

export default SettingsGeneral;