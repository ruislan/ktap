import React from 'react';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { FormControl } from "baseui/form-control";
import { Input } from 'baseui/input';
import { HeadingSmall, LabelSmall } from 'baseui/typography';
import { Messages } from '../../constants';
import Notification from '../../components/notification';
import { useAuth } from '../../hooks/use-auth';

function SettingsPassword() {
    const { user } = useAuth();
    const [form, setForm] = React.useState({
        oldPassword: '',
        newPassword: '',
    });
    const [notification, setNotification] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification(null);
        setIsLoading(true);
        try {
            const res = await fetch('/api/settings/password', { method: 'PUT', body: JSON.stringify({ ...form }), headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                setNotification({ kind: 'positive', message: Messages.updated });
            } else {
                const data = await res.json();
                setNotification({ kind: 'negative', message: data.message });
            }
        } catch (e) {
            setNotification({ kind: 'negative', message: Messages.unknownError });
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600' justifyContent='flex-start'>
            <HeadingSmall marginTop='0' marginBottom='scale600'>更改密码</HeadingSmall>
            {notification && <Notification kind={notification.kind} message={notification.message} />}
            <form onSubmit={handleSubmit}>
                <input type='text' hidden readOnly autoComplete='username' name='username' value={user.name} />  {/* avoid chrome warning */}
                <FormControl label={<LabelSmall>旧密码</LabelSmall>}>
                    <Input size='compact'
                        value={form.oldPassword}
                        type='password'
                        onChange={e => setForm({ ...form, oldPassword: e.currentTarget.value })}
                    />
                </FormControl>
                <FormControl label={<LabelSmall>新密码</LabelSmall>} caption={'密码不能少于6个字符'}>
                    <Input size='compact'
                        value={form.newPassword}
                        type='password'
                        onChange={e => setForm({ ...form, newPassword: e.currentTarget.value })}
                    />
                </FormControl>
                <Block marginTop='scale600'><Button isLoading={isLoading} disabled={form.oldPassword.length < 6 || form.newPassword.length < 6 || form.oldPassword != form.newPassword} size='compact' type='submit' kind='secondary'>保存</Button></Block>
            </form>
        </Block>
    );
}

export default SettingsPassword;