import React from 'react';

import { Block } from 'baseui/block';
import { LabelSmall } from 'baseui/typography';
import { Input } from 'baseui/input';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { useSnackbar } from 'baseui/snackbar';
import { Textarea } from "baseui/textarea";
import { DatePicker } from 'baseui/datepicker';
import { Check, Delete } from 'baseui/icon';

function AppDetailInfo({ data, onChanged }) {
    const { enqueue } = useSnackbar();
    const [isLoading, setIsLoading] = React.useState(false);
    const [app, setApp] = React.useState({
        name: data.name || '',
        slogan: data.slogan || '',
        summary: data.summary || '',
        description: data.description || '',
        releasedAt: data.releasedAt,
        downloadUrl: data.downloadUrl || '',
        legalText: data.legalText || '',
        legalUrl: data.legalUrl || '',
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ app })
            });
            if (res.ok) {
                enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                if (onChanged) onChanged();
            } else {
                enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Block display='flex' flexDirection='column'>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSave();
            }}>
                <FormControl label={<LabelSmall>名称</LabelSmall>}>
                    <Input size='compact' placeholder='游戏名' value={app.name} type='text' onChange={e => setApp(prev => { return { ...prev, name: e.target.value } })} />
                </FormControl>
                <FormControl label={<LabelSmall>标语</LabelSmall>}>
                    <Input size='compact' placeholder='一句话突出游戏特点' value={app.slogan} type='text' onChange={e => setApp(prev => { return { ...prev, slogan: e.target.value } })} />
                </FormControl>
                <FormControl label={<LabelSmall>简介</LabelSmall>}>
                    <Textarea size='compact' placeholder='简短介绍一下游戏内容' value={app.summary} onChange={e => setApp(prev => { return { ...prev, summary: e.target.value } })} />
                </FormControl>
                <FormControl label={<LabelSmall>详细</LabelSmall>} caption='可以添加HTML标签'>
                    <Textarea size='compact' placeholder='详细介绍游戏内容' rows={10} value={app.description} onChange={e => setApp(prev => { return { ...prev, description: e.target.value } })} />
                </FormControl>
                <FormControl label={<LabelSmall>发布于</LabelSmall>}>
                    <DatePicker size='compact' value={new Date(app.releasedAt)} onChange={({ date }) => setApp(prev => { return { ...prev, releasedAt: date } })} />
                </FormControl>
                <FormControl label={<LabelSmall>下载链接</LabelSmall>}>
                    <Input size='compact' value={app.downloadUrl} type='text' onChange={e => setApp(prev => { return { ...prev, downloadUrl: e.target.value } })} />
                </FormControl>
                <FormControl label={<LabelSmall>法律声明</LabelSmall>}>
                    <Textarea size='compact' value={app.legalText} onChange={e => setApp(prev => { return { ...prev, legalText: e.target.value } })} />
                </FormControl>
                <FormControl label={<LabelSmall>法律声明链接</LabelSmall>}>
                    <Input size='compact' value={app.legalUrl || ''} type='text' onChange={e => setApp(prev => { return { ...prev, legalUrl: e.target.value } })} />
                </FormControl>
                <Block display='flex' marginTop='scale600'>
                    <Block><Button kind='secondary' size='compact' type='submit' isLoading={isLoading}>保存</Button></Block>
                </Block>
            </form>
        </Block>
    );
}

export default AppDetailInfo;