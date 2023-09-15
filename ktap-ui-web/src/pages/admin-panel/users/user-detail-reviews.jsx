import React from 'react';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Spinner } from 'baseui/spinner';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { LabelSmall } from 'baseui/typography';
import { ArrowLeft, ArrowRight, Check, Delete } from 'baseui/icon';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';

import { DateTime, PAGE_LIMIT_SMALL } from '@ktap/libs/utils';
import { Eye, Icon, TrashBin } from '@ktap/components/icons';

function UserDetailReviews({ data }) {
    const limit = PAGE_LIMIT_SMALL;
    const { enqueue } = useSnackbar();
    const [isLoading, setIsLoading] = React.useState(true);
    const [reviews, setReviews] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasNext, setHasNext] = React.useState(false);
    const [hasPrev, setHasPrev] = React.useState(false);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState(null);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/users/${data.id}/reviews?skip=${skip}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                setReviews(json.data);
                setHasNext(json.skip + json.limit < json.count);
                setHasPrev(json.skip + json.limit > json.limit);
            }
        } finally {
            setIsLoading(false);
        }
    }, [data, skip, limit]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async () => {
        if (!selectedId) return;
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/reviews/${selectedId}`, { method: 'DELETE' });
            if (res.ok) {
                enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                fetchData();
            } else {
                enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsLoading(false);
            setIsOpenDeleteConfirmModal(false);
        }
    };

    return (
        <Block display='flex' flexDirection='column'>
            {isLoading
                ? <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'>
                    <Spinner $size='scale1600' $borderWidth='scale300' $color='primary' />
                </Block>
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
                    <TableBuilder data={reviews} size='compact' emptyMessage='没有数据'
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
                        <TableBuilderColumn header='分数'>
                            {row => <LabelSmall>{row.score}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='创建于'>
                            {row => <LabelSmall>{DateTime.format(row?.createdAt)}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='操作'>
                            {(row) => (<Block display='flex' alignItems='center' gridGap='scale300'>
                                <Button kind='secondary' size='mini' shape='circle' onClick={() => window.open(`/reviews/${row.id}`)}><Icon><Eye /></Icon></Button>
                                <Button kind='secondary' size='mini' shape='circle' onClick={() => {
                                    setSelectedId(row.id);
                                    setIsOpenDeleteConfirmModal(true);
                                }}><Icon><TrashBin /></Icon></Button>
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
                <ModalHeader>是否删除评测？</ModalHeader>
                <ModalBody>您确定要删除这篇评测吗？该操作将会删除该评测相关的所有内容，包括<b>礼物</b>、<b>回复</b>等等。该操作<b>不能撤消</b>。</ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenDeleteConfirmModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleDelete()} isLoading={isLoading}>确定</ModalButton>
                </ModalFooter>
            </Modal>
        </Block>
    );
}

export default UserDetailReviews;