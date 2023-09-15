import React from 'react';

import { Block } from 'baseui/block';
import { LabelSmall } from 'baseui/typography';
import { Input } from 'baseui/input';
import { Button } from 'baseui/button';
import { Select } from "baseui/select";
import { FormControl } from 'baseui/form-control';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';
import { Check, Delete, Plus } from 'baseui/icon';

import { Icon, TrashBin } from '@ktap/components/icons';
import { SocialLinks } from '@ktap/libs/utils';

function AppDetailContact({ data }) {
    const { enqueue } = useSnackbar();
    const [isLoading, setIsLoading] = React.useState(true);
    const [socialLinks, setSocialLinks] = React.useState([]);
    const [brand, setBrand] = React.useState([SocialLinks.options[0]]);
    const [name, setName] = React.useState('');
    const [url, setUrl] = React.useState('');
    const [isOpenAddModal, setIsOpenAddModal] = React.useState(false);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState(null);


    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/social-links`);
            if (res.ok) {
                const json = await res.json();
                setSocialLinks(json.data);
            }
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/social-links`, { method: 'POST', body: JSON.stringify({ brand: brand[0].id, name, url }), headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                setIsOpenAddModal(false);
                fetchData();
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
            const res = await fetch(`/admin/apps/${data.id}/social-links/${selectedId}`, { method: 'DELETE' });
            if (res.ok) {
                enqueue({ message: '删除成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                fetchData();
            } else {
                enqueue({ message: '删除失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsOpenDeleteConfirmModal(false);
            setIsLoading(false);
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
            <TableBuilder data={socialLinks} size='compact' emptyMessage='没有数据'
                overrides={{
                    TableBodyCell: {
                        style: {
                            verticalAlign: 'middle',
                        }
                    }
                }}
            >
                <TableBuilderColumn header='类别'>
                    {row => <LabelSmall>{SocialLinks.getDisplayLabel(row.brand) || row.brand}</LabelSmall>}
                </TableBuilderColumn>
                <TableBuilderColumn header='展示名称'>
                    {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='100px' maxWidth='100px' overflow='hidden'>{row.name}</LabelSmall>}
                </TableBuilderColumn>
                <TableBuilderColumn header='链接'>
                    {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='160px' maxWidth='160px' overflow='hidden'>{row.url}</LabelSmall>}
                </TableBuilderColumn>
                <TableBuilderColumn header='操作'>
                    {row => (<Block display='flex' alignItems='center' gridGap='scale300'>
                        <Button kind='secondary' size='mini' shape='circle' onClick={(e) => {
                            e.preventDefault();
                            setSelectedId(row.id);
                            setIsOpenDeleteConfirmModal(true);
                        }}><Icon><TrashBin /></Icon></Button>
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
                <ModalHeader>是否删除回复？</ModalHeader>
                <ModalBody>您确定要删除这篇回复吗？该操作<b>不能撤消</b>。</ModalBody>
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
                <ModalHeader>新增社交联系</ModalHeader>
                <ModalBody>
                    <Block display='grid' gridTemplateColumns='1fr 1fr' gridGap='scale300'>
                        <Block>
                            <FormControl label={<LabelSmall>类别</LabelSmall>}>
                                <Select size='compact' clearable={false} value={brand} onChange={({ value }) => setBrand(value)} options={SocialLinks.options}></Select>
                            </FormControl>
                        </Block>
                        <Block>
                            <FormControl label={<LabelSmall>名称</LabelSmall>}>
                                <Input size='compact' value={name} onChange={e => setName(e.target.value)}></Input>
                            </FormControl>
                        </Block>
                    </Block>
                    <FormControl label={<LabelSmall>跳转链接</LabelSmall>}>
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

export default AppDetailContact;