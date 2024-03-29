import React from 'react';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { FormControl } from "baseui/form-control";
import { Input } from 'baseui/input';
import { HeadingSmall, LabelSmall } from 'baseui/typography';
import { Select } from 'baseui/select';
import { Textarea } from "baseui/textarea";

import { useAuth } from '@ktap/hooks/use-auth';
import { DateTime, Gender, IMAGE_UPLOAD_SIZE_LIMIT, Messages } from '@ktap/libs/utils';
import RdPicker from '@ktap/components/rdpicker';
import Notification from '@ktap/components/notification';
import AvatarSquare from '@ktap/components/avatar-square';

function SettingsAvatar({ setNotification }) {
    const { user, setUser } = useAuth();
    const avatarInput = React.useRef(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAvatarSelected = async (e) => {
        e.preventDefault();
        setNotification(null);
        const file = e.target.files[0];
        if (file) {
            if (file.size > IMAGE_UPLOAD_SIZE_LIMIT) { // check file size
                setNotification({ kind: 'negative', message: '图片大小不能超过10MB' });
                return;
            }
            try {
                setIsLoading(true);
                setNotification({ kind: 'info', message: '正在上传...' });
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/settings/avatar', { method: 'POST', body: formData, });
                const data = await res.json();
                if (res.ok) {
                    setUser({ ...user, avatar: data.avatar });
                    setNotification({ kind: 'positive', message: Messages.updated });
                } else {
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
        }
    };
    return (
        <Block display='flex' flexDirection='column' marginBottom='scale600'>
            <Block display='flex' justifyContent='flex-start'>
                <AvatarSquare name={user?.name} size='128px' src={user?.avatar} />
            </Block>
            <Block paddingTop='scale300' paddingBottom='scale300' display='flex' alignItems='center' justifyContent='flex-start'>
                <input ref={avatarInput} type='file' hidden accept='image/*' onChange={handleAvatarSelected} />
                <Button kind='secondary' size='compact' type='button' isLoading={isLoading} onClick={() => avatarInput.current.click()}>
                    上传新头像
                </Button>
            </Block>
        </Block>
    );
}

function SettingsForm({ setNotification }) {
    const { user, setUser } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);
    const [form, setForm] = React.useState({
        location: user?.location || '',
        bio: user?.bio || '',
        gender: [{ id: user?.gender }],
        birthday: DateTime.formatShort(user?.birthday),
    });

    const handleSubmit = async () => {
        if (form.bio.length > 255 || form.location.length > 100) return;
        setNotification(null);
        setIsLoading(true);
        try {
            const formData = { ...form, gender: form.gender[0]?.id?.toUpperCase() };
            const res = await fetch('/api/settings/profile', { method: 'PUT', body: JSON.stringify(formData), headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                setUser({ ...user, ...formData });
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
        <form onSubmit={e => {
            e.preventDefault();
            handleSubmit();
        }}>
            <FormControl label={<LabelSmall>性别</LabelSmall>}>
                <Select options={Gender.options} size='compact' value={form.gender}
                    clearable={false} backspaceRemoves={false}
                    onChange={options => setForm({ ...form, gender: options.value })}
                />
            </FormControl>
            <FormControl label={<LabelSmall>生日</LabelSmall>}>
                <RdPicker value={new Date(form.birthday)} onSelect={(date) => setForm({ ...form, birthday: DateTime.formatShort(date) })} />
            </FormControl>
            <FormControl label={<LabelSmall>简介</LabelSmall>} counter={{ length: form.bio.length, maxLength: 255 }}>
                <Textarea size='compact' value={form.bio} error={form.bio.length > 255}
                    onChange={e => setForm({ ...form, bio: e.currentTarget.value })}
                />
            </FormControl>
            <FormControl label={<LabelSmall>地址</LabelSmall>} counter={{ length: form.location.length, maxLength: 100 }}>
                <Input value={form.location} size='compact' error={form.location.length > 100}
                    onChange={e => setForm({ ...form, location: e.currentTarget.value })}
                />
            </FormControl>
            <Block marginTop='scale600'><Button type='submit' isLoading={isLoading} size='compact' kind='secondary'>保存</Button></Block>
        </form>
    );
}

function SettingsProfile() {
    const [notification, setNotification] = React.useState(null);

    return (
        <Block display='flex' flexDirection='column'
            justifyContent='flex-start' overrides={{
                Block: {
                    style: {
                        overflowWrap: 'break-word',
                    }
                }
            }}>
            <HeadingSmall marginTop='0' marginBottom='scale600'>个性化</HeadingSmall>
            {notification && <Notification kind={notification.kind} message={notification.message} />}
            <SettingsAvatar setNotification={setNotification} />
            <SettingsForm setNotification={setNotification} />
        </Block>
    );
}

export default SettingsProfile;