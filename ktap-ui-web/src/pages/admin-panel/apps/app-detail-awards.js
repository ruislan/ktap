import React from 'react';

import { Block } from 'baseui/block';
import { LabelSmall } from 'baseui/typography';
import { Input } from 'baseui/input';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';
import { StyledLink } from 'baseui/link';
import { Check, Delete, Plus } from 'baseui/icon';
import { ExternalLink, TrashBin } from '../../../components/icons';

function AppDetailAwards({ data }) {
    const { enqueue } = useSnackbar();
    const [isLoading, setIsLoading] = React.useState(true);
    const [awards, setAwards] = React.useState([]);
    const [image, setImage] = React.useState('');
    const [url, setUrl] = React.useState('');
    const [isOpenAddModal, setIsOpenAddModal] = React.useState(false);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState(null);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/awards`);
            if (res.ok) {
                const json = await res.json();
                setAwards(json.data);
            }
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/awards`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image, url, }),
                });
            if (res.ok) {
                enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                fetchData();
                setImage('');
                setUrl('');
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
            const res = await fetch(`/admin/apps/${data.id}/awards/${selectedId}`, { method: 'DELETE' });
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
            <TableBuilder data={awards} size='compact' emptyMessage='没有数据'
                overrides={{
                    TableBodyCell: {
                        style: {
                            verticalAlign: 'middle',
                        }
                    }
                }}
            >
                <TableBuilderColumn header='图片'>
                    {row =>
                        <Block display='flex' alignItems='center' gridGap='scale300'>
                            <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='220px' maxWidth='220px' overflow='hidden'>{row.image}</LabelSmall>
                            <Block display='flex'><StyledLink href={row.image} target='_blank'><ExternalLink width={16} /></StyledLink></Block>
                        </Block>
                    }
                </TableBuilderColumn>
                <TableBuilderColumn header='外链'>
                    {row =>
                        <Block display='flex' alignItems='center' gridGap='scale300'>
                            <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='220px' maxWidth='220px' overflow='hidden'>{row.url}</LabelSmall>
                            {row.url && <Block display='flex'><StyledLink href={row.url} target='_blank'><ExternalLink width={16} /></StyledLink></Block>}
                        </Block>
                    }
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
                <ModalHeader>是否删除奖项？</ModalHeader>
                <ModalBody>您确定要删除这个奖项吗？该操作<b>不能撤消</b>。</ModalBody>
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
                <ModalHeader>新增奖项</ModalHeader>
                <ModalBody>
                    <FormControl label={<LabelSmall>图片链接</LabelSmall>}>
                        <Input size='compact' value={image} onChange={e => setImage(e.target.value)}></Input>
                    </FormControl>
                    <FormControl label={<LabelSmall>外部链接</LabelSmall>}>
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

export default AppDetailAwards;