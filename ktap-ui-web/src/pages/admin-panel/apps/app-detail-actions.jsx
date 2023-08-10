/* eslint-disable */
import React from 'react';

import { Block } from 'baseui/block';
import { Checkbox, } from 'baseui/checkbox';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { LabelSmall } from 'baseui/typography';
import { Input } from 'baseui/input';
import { useSnackbar } from 'baseui/snackbar';
import { Check, Delete } from 'baseui/icon';

function AppDetailActions({ data, onChanged }) {
    const { enqueue } = useSnackbar();
    const [isVisible, setIsVisible] = React.useState(data?.isVisible);
    const [score, setScore] = React.useState(data?.score);
    const [isLoading, setIsLoading] = React.useState(false);
    const handleSave = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/apps/${data.id}/basis`, {
                method: 'PUT',
                body: JSON.stringify({ score, isVisible }),
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
        <form onSubmit={(e) => {
            e.preventDefault();
            handleSave();
        }}>
            <Block display='flex' flexDirection='column' gridGap='scale300'>
                <Block marginBottom='scale300'><Checkbox checked={isVisible} onChange={e => setIsVisible(e.target.checked)}>可见</Checkbox></Block>
                <FormControl label={<LabelSmall>调整分数</LabelSmall>} caption='[1-5]，评论的变化依然会更新此分数'>
                    <Input size='compact' value={score} type='number' min={1.0} max={5.0} step={0.1} onChange={e => setScore(e.target.value)} />
                </FormControl>
                <Block display='flex'>
                    <Block><Button kind='secondary' size='compact' type='submit' isLoading={isLoading}>保存</Button></Block>
                </Block>
            </Block>
        </form>

    );
}

export default AppDetailActions;