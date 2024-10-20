import React from 'react';

import { Block } from 'baseui/block';
import { Checkbox, } from 'baseui/checkbox';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { LabelSmall } from 'baseui/typography';
import { Input } from 'baseui/input';
import { useSnackbar } from 'baseui/snackbar';
import { Check, Delete } from 'baseui/icon';

function UserDetailActions({ data, onChanged }) {
    const { enqueue } = useSnackbar();
    const [isLocked, setIsLocked] = React.useState(data?.isLocked);
    const [isAdmin, setIsAdmin] = React.useState(data?.isAdmin);
    const [amount, setAmount] = React.useState(0);
    const [title, setTitle] = React.useState(data?.title);
    const [isLoading, setIsLoading] = React.useState(false);
    const handleSaveUser = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/users/${data.id}/basis`, {
                method: 'PUT',
                body: JSON.stringify({ isLocked, isAdmin, amount, title, }),
                headers: { 'Content-Type': 'application/json' }
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
                handleSaveUser();
            }}>

                <Block marginBottom='scale0'><Checkbox checked={isLocked} onChange={e => setIsLocked(e.target.checked)}>禁用</Checkbox></Block>
                <Block marginBottom='scale600'><Checkbox checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)}>设为管理员</Checkbox></Block>
                <FormControl label={<LabelSmall>{amount >= 0 ? '赠送' : '罚没'}余额</LabelSmall>} caption={`用户余额：${data.balance}`}>
                    <Input size='compact' value={amount} max={999999999} min={0 - (data?.balance || 0)} type='number' error={amount > 999999999 || amount < (0 - data?.balance || 0)} onChange={e => setAmount(e.target.value)} />
                </FormControl>
                <FormControl label={<LabelSmall>赐予称号</LabelSmall>} caption={`称号会显示在用户名称下方`}>
                    <Input size='compact' value={title} type='text' onChange={e => setTitle(e.target.value)} />
                </FormControl>
                <Block display='flex'>
                    <Block><Button kind='secondary' size='compact' type='submit' isLoading={isLoading}>保存</Button></Block>
                </Block>

            </form>
        </Block>
    );
}

export default UserDetailActions;