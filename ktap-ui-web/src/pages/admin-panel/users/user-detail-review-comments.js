import React from 'react';
import dayjs from 'dayjs';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Spinner } from 'baseui/spinner';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { LabelSmall } from 'baseui/typography';
import { Eye, TrashBin } from '../../../components/icons';
import { ArrowLeft, ArrowRight, Check, Delete } from 'baseui/icon';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';

function UserDetailComments({ data }) {
    const limit = 10;
    const { enqueue } = useSnackbar();
    const [isLoading, setIsLoading] = React.useState(true);
    const [comments, setComments] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasNext, setHasNext] = React.useState(false);
    const [hasPrev, setHasPrev] = React.useState(false);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState(null);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/users/${data.id}/review-comments?skip=${skip}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                setComments(json.data);
                setHasNext(json.skip + json.limit < json.count);
                setHasPrev(json.skip + json.limit > json.limit);
            }
        } finally {
            setIsLoading(false);
        }
    }, [data, skip]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async () => {
        if (!selectedId) return;
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/review-comments/${selectedId}`, { method: 'DELETE' });
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
    return (
        <Block display='flex' flexDirection='column'>
            {isLoading
                ? <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'><Spinner $size='scale1400' $borderWidth='scale200' /></Block>
                :
                <Block display='flex' flexDirection='column'>
                    <Block marginBottom='scale600' display='flex' alignItems='center' justifyContent='flex-end'>
                        <Block display='flex' gridGap='scale300'>
                            <Button size='mini' kind='secondary' shape='circle' isLoading={isLoading} disabled={!hasPrev}
                                onClick={() => setSkip(prev => prev - limit)}>
                                <ArrowLeft width={16} title='上一页' />
                            </Button>
                            <Button size='mini' kind='secondary' shape='circle' isLoading={isLoading} disabled={!hasNext}
                                onClick={() => setSkip(prev => prev + limit)}>
                                <ArrowRight width={16} title='下一页' />
                            </Button>
                        </Block>
                    </Block>
                    <TableBuilder data={comments} size='compact' emptyMessage='没有数据'
                        overrides={{
                            TableBodyCell: {
                                style: {
                                    verticalAlign: 'middle',
                                }
                            }
                        }}
                    >
                        <TableBuilderColumn header='ID'>
                            {row => <LabelSmall >{row.id}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='内容'>
                            {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='200px' maxWidth='200px' overflow='hidden'>{row.content}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='创建于'>
                            {row => <LabelSmall>{dayjs(row?.createdAt).format('YYYY-MM-DD HH:mm:ss')}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='操作'>
                            {(row) => (<Block display='flex' alignItems='center' gridGap='scale300'>
                                <Button kind='secondary' size='mini' shape='circle' onClick={() => window.open(`/reviews/${row.reviewId}`)}><Eye width={16} height={16} /></Button>
                                <Button kind='secondary' size='mini' shape='circle' onClick={() => {
                                    setSelectedId(row.id);
                                    setIsOpenDeleteConfirmModal(true);
                                }}><TrashBin width={16} height={16} /></Button>
                            </Block>)}
                        </TableBuilderColumn>
                    </TableBuilder>
                </Block>
            }
            <Modal onClose={() => setIsOpenDeleteConfirmModal(false)}
                closeable={false}
                isOpen={isOpenDeleteConfirmModal}
                animate
                autoFocus
                role={ROLE.alertdialog}
            >
                <ModalHeader>是否删除回复？</ModalHeader>
                <ModalBody>您确定要删除这篇回复吗？该操作<b>不能撤消</b>。</ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenDeleteConfirmModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleDelete()} isLoading={isLoading}>确定</ModalButton>
                </ModalFooter>
            </Modal>
        </Block>
    );
}

export default UserDetailComments;