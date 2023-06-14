import React from 'react';

import { Block } from 'baseui/block';
import { Input } from 'baseui/input';
import { LabelSmall, LabelXSmall, ParagraphXSmall } from 'baseui/typography';
import { FormControl } from 'baseui/form-control';
import { Checkbox } from 'baseui/checkbox';
import { Textarea } from 'baseui/textarea';
import { useSnackbar } from 'baseui/snackbar';
import { Check, Delete, } from 'baseui/icon';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';

const initForm = { userId: 1, content: '', count: 1, score: 4, isAll: false };

function ReviewMonkeyModal({ isOpen, setIsOpen, onSuccess = () => { }, onFail = () => { } }) {
    const { enqueue } = useSnackbar();
    const [isLoading, setIsLoading] = React.useState(false);
    const [form, setForm] = React.useState(initForm);

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/reviews/monkey`, {
                method: 'POST',
                body: JSON.stringify({ ...form }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                enqueue({ message: '操作完成', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                setIsOpen(false);
                setForm(initForm);
                onSuccess();
            } else {
                enqueue({ message: '操作失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
                onFail();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal onClose={() => setIsOpen(false)} closeable={false}
            isOpen={isOpen} animate autoFocus role={ROLE.dialog}
        >
            <ModalHeader>评测乱入</ModalHeader>
            <ModalBody $as='div'>
                <ParagraphXSmall marginTop='0'>慎用！此乱入将会使用一个用户对所选数量的游戏进行评测。当然，会遵循一个用户对一个游戏只能有一个评论的规则。并且，评测将不支持回复。</ParagraphXSmall>
                <FormControl label={<LabelSmall>用户ID</LabelSmall>}>
                    <Input size='compact' required type='number' min={1} value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} />
                </FormControl>
                <FormControl label={<LabelSmall>内容</LabelSmall>}>
                    <Textarea size='compact' required rows={10} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                </FormControl>
                <FormControl label={<LabelSmall>评分</LabelSmall>}>
                    <Input size='compact' required type='number' min={1} max={5} value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} />
                </FormControl>
                <FormControl label={<LabelSmall>游戏数量</LabelSmall>} caption='会对最近的所选数量的游戏进行评测'>
                    <Input size='compact' type='number' min={1} disabled={form.isAll} value={form.count}
                        onChange={e => setForm({ ...form, count: e.target.value })}
                        endEnhancer={() => (
                            <Block display='flex' alignItems='center' gridGap='scale100'>
                                <Checkbox checked={form.isAll} onChange={e => setForm({ ...form, isAll: e.target.checked })} labelPlacement='left' />
                                <LabelXSmall whiteSpace='nowrap'>全部</LabelXSmall>
                            </Block>
                        )}
                    />
                </FormControl>
            </ModalBody>
            <ModalFooter>
                <ModalButton kind='tertiary' onClick={() => setIsOpen(false)}>取消</ModalButton>
                <ModalButton onClick={() => handleSubmit()} isLoading={isLoading}>Let's roll</ModalButton>
            </ModalFooter>
        </Modal >
    );
}

export default ReviewMonkeyModal;