import React from 'react';

import { Block } from 'baseui/block';
import { LabelSmall } from 'baseui/typography';
import { Input } from 'baseui/input';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Textarea } from 'baseui/textarea';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';
import { Check, Delete, Plus } from 'baseui/icon';

import { TrashBin } from '@ktap/components/icons';

function AppDetailProReviews({ data }) {
    const { enqueue } = useSnackbar();
    const [isLoading, setIsLoading] = React.useState(true);
    const [proReviews, setProReviews] = React.useState([]);
    const [name, setName] = React.useState('');
    const [score, setScore] = React.useState('');
    const [url, setUrl] = React.useState('');
    const [summary, setSummary] = React.useState('');
    const [isOpenAddModal, setIsOpenAddModal] = React.useState(false);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState(null);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/pro-reviews`);
            if (res.ok) {
                const json = await res.json();
                setProReviews(json.data);
            }
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/pro-reviews`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, url, summary, score }),
                });
            if (res.ok) {
                enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                fetchData();
                setName('');
                setUrl('');
                setSummary('');
                setScore('');
                setIsOpenAddModal(false);
            } else {
                enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/pro-reviews/${selectedId}`, { method: 'DELETE' });
            if (res.ok) {
                enqueue({ message: '删除成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                fetchData();
            } else {
                enqueue({ message: '删除失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsLoading(false);
            setIsOpenDeleteConfirmModal(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <Block display='flex' flexDirection='column'>
            <Block display='flex' gridGap='scale300' justifyContent='flex-end' alignItems='center' marginBottom='scale600'>
                <Button size='mini' shape='circle' onClick={() => setIsOpenAddModal(true)} kind='secondary'><Plus /></Button>
            </Block>
            <TableBuilder data={proReviews} size='compact' emptyMessage='没有数据'
                overrides={{
                    TableBodyCell: {
                        style: {
                            verticalAlign: 'middle',
                        }
                    }
                }}
            >
                <TableBuilderColumn header='作者/机构'>
                    {row => <LabelSmall>{row.name}</LabelSmall>}
                </TableBuilderColumn>
                <TableBuilderColumn header='分数'>
                    {row => <LabelSmall>{row.score}</LabelSmall>}
                </TableBuilderColumn>
                <TableBuilderColumn header='评价'>
                    {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='160px' maxWidth='160px' overflow='hidden'>{row.summary}</LabelSmall>}
                </TableBuilderColumn>
                <TableBuilderColumn header='原文银接'>
                    {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='160px' maxWidth='100px' overflow='hidden'>{row.url}</LabelSmall>}
                </TableBuilderColumn>
                <TableBuilderColumn header='操作'>
                    {row => (<Block display='flex' alignItems='center' gridGap='scale300'>
                        <Button kind='secondary' size='mini' shape='circle' onClick={(e) => {
                            e.preventDefault();
                            setSelectedId(row.id);
                            setIsOpenDeleteConfirmModal(true);
                        }}><TrashBin width={16} height={16} /></Button>
                    </Block>)}
                </TableBuilderColumn>
            </TableBuilder>

            <Modal onClose={() => setIsOpenDeleteConfirmModal(false)}
                closeable={false}
                isOpen={isOpenDeleteConfirmModal}
                animate
                autoFocus
                role={ROLE.alertdialog}
            >
                <ModalHeader>是否删除专业评测？</ModalHeader>
                <ModalBody>您确定要删除这篇专业评测吗？该操作<b>不能撤消</b>。</ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenDeleteConfirmModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleDelete()} isLoading={isLoading}>确定</ModalButton>
                </ModalFooter>
            </Modal>

            <Modal onClose={() => setIsOpenAddModal(false)}
                closeable={false}
                isOpen={isOpenAddModal}
                animate
                autoFocus
                role={ROLE.dialog}
            >
                <ModalHeader>新增专业评测</ModalHeader>
                <ModalBody>
                    <Block display='grid' gridTemplateColumns='1fr 1fr' gridGap='scale300'>
                        <Block>
                            <FormControl label={<LabelSmall>作者/机构</LabelSmall>}>
                                <Input size='compact' value={name} onChange={e => setName(e.target.value)}></Input>
                            </FormControl>
                        </Block>
                        <Block>
                            <FormControl label={<LabelSmall>分数</LabelSmall>}>
                                <Input size='compact' value={score} onChange={e => setScore(e.target.value)}></Input>
                            </FormControl>
                        </Block>
                    </Block>
                    <FormControl label={<LabelSmall>评价</LabelSmall>} caption='纯文本'>
                        <Textarea size='compact' rows={4} value={summary} onChange={e => setSummary(e.target.value)} />
                    </FormControl>
                    <FormControl label={<LabelSmall>原文链接</LabelSmall>}>
                        <Input size='compact' value={url} onChange={e => setUrl(e.target.value)}></Input>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenAddModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleSave()} isLoading={isLoading}>确定</ModalButton>
                </ModalFooter>
            </Modal>
        </Block >

    );
}

export default AppDetailProReviews;