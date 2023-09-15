import React from 'react';

import { Block } from 'baseui/block';
import { useSnackbar } from 'baseui/snackbar';
import { Spinner } from 'baseui/spinner';
import { useStyletron } from 'baseui';
import { LabelSmall, LabelXSmall } from 'baseui/typography';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Check, Delete, Plus } from 'baseui/icon';
import { Button } from 'baseui/button';
import { Select } from 'baseui/select';

import { ChatAlt2Outline, Icon } from '@ktap/components/icons';
import Tag from '@ktap/components/tag';

function AppDetailDiscussions({ data }) {
    const [css, theme] = useStyletron();
    const { enqueue } = useSnackbar();

    const [isLoading, setIsLoading] = React.useState(true);
    const [dataList, setDataList] = React.useState([]);

    const [form, setForm] = React.useState({ id: '', name: '', description: '', icon: '' });

    const [isOpenEditModal, setIsOpenEditModal] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
    const [transferChannel, setTransferChannel] = React.useState([]);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const [isOpenModeratorModal, setIsOpenModeratorModal] = React.useState(false);
    const [isSavingModerator, setIsSavingModerator] = React.useState(false);
    const [isLoadingModerator, setIsLoadingModerator] = React.useState(false);
    const [moderators, setModerators] = React.useState([]);
    const [moderatorIds, setModeratorIds] = React.useState('');

    const fetchData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/apps/${data.id}/discussion-channels`);
            if (res.ok) {
                const json = await res.json();
                setDataList(json.data);
            }
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    const fetchModerator = React.useCallback(async () => {
        if (isOpenModeratorModal) {
            try {
                setModerators([]);
                setIsLoadingModerator(true);
                const res = await fetch(`/admin/apps/${data.id}/discussion-channels/${form.id}/moderators`);
                if (res.ok) {
                    const json = await res.json();
                    setModerators(json.data);
                }
            } finally {
                setIsLoadingModerator(false);
            }
        }
    }, [isOpenModeratorModal, data, form]);

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            const url = form.id ? `/admin/apps/${data.id}/discussion-channels/${form.id}` : `/admin/apps/${data.id}/discussion-channels`;
            const method = form.id ? 'PUT' : 'POST';
            const res = await fetch(url, { method, body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, });
                fetchData();
                setIsOpenEditModal(false);
            } else {
                if (res.status === 400) {
                    const json = await res.json();
                    enqueue({ message: json.message, startEnhancer: ({ size }) => <Delete size={size} color='negative' />, });
                } else {
                    setIsOpenEditModal(false);
                    enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, });
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const res = await fetch(`/admin/apps/${data.id}/discussion-channels/${form.id}`,
                {
                    body: JSON.stringify({ toId: transferChannel[0].id }),
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
            if (res.ok) {
                enqueue({ message: '删除成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, });
                fetchData();
            } else {
                enqueue({ message: '删除失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, });
            }
        } finally {
            setIsOpenDeleteModal(false);
            setIsDeleting(false);
        }
    };

    const handleSaveModerator = async () => {
        try {
            setIsSavingModerator(true);
            if (moderatorIds === '') return;
            const res = await fetch(`/admin/apps/${data.id}/discussion-channels/${form.id}/moderators`,
                {
                    body: JSON.stringify({ ids: moderatorIds.split(',').map(x => x.trim()) }),
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' }
                });
            if (res.ok) {
                enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, });
                fetchModerator();
            } else {
                let message = '保存失败，稍后再试，或者请联系技术人员处理';
                if (res.status === 400) {
                    const json = await res.json();
                    const failureIds = json.failures.join(',');
                    message = `用户 ID [${failureIds}] 删除失败。请检查是否输入了正确的 ID。`;
                }
                enqueue({ message, startEnhancer: ({ size }) => <Delete size={size} color='negative' />, });
            }
        } finally {
            setIsSavingModerator(false);
        }
    };

    const handleDeleteModerator = async (moderatorId) => {
        const res = await fetch(`/admin/apps/${data.id}/discussion-channels/${form.id}/moderators/${moderatorId}`, { method: 'DELETE' });
        if (res.ok) {
            enqueue({ message: '删除成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, });
            fetchModerator();
        } else {
            enqueue({ message: '删除失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, });
        }
    };

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    React.useEffect(() => {
        fetchModerator();
    }, [fetchModerator]);

    return (
        <Block display='flex' flexDirection='column' gridGap='scale900'>
            {isLoading ?
                <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'>
                    <Spinner $size='scale1600' $borderWidth='scale300' $color='primary' />
                </Block>
                :
                <Block display='flex' flexWrap gridGap='scale300' width='100%'>
                    {dataList.map((channel, index) => (
                        <div key={index} className={css({
                            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: theme.sizing.scale600, overflow: 'hidden',
                            cursor: 'pointer', position: 'relative', padding: theme.sizing.scale300, minWidth: '240px', maxWidth: '240px', width: '240px',
                            backgroundColor: theme.colors.backgroundSecondary,
                            borderRadius: theme.borders.radius300, textDecoration: 'none', color: 'inherit',
                        })}>
                            <Block display='flex' gridGap='scale300' alignItems='center'>
                                {channel.icon
                                    ? <img src={channel.icon} className={css({ objectFit: 'cover', borderRadius: theme.borders.radius300, width: theme.sizing.scale1200, height: theme.sizing.scale1200 })} alt={channel.name} />
                                    : <div className={css({
                                        borderRadius: theme.borders.radius300, width: theme.sizing.scale1200, height: theme.sizing.scale1200,
                                    })} title={channel.name}>
                                        <Icon $size='full'><ChatAlt2Outline /></Icon>
                                    </div>
                                }
                                <Block display='flex' flexDirection='column' gridGap='scale100' width='calc(100% - 56px)'>
                                    <LabelSmall color='primary100'>{channel.name}</LabelSmall>
                                    <LabelXSmall color='primary300' width='100%' whiteSpace='nowrap' overflow='hidden' textOverflow='ellipsis'>{channel.description}</LabelXSmall>
                                </Block>
                            </Block>
                            <Block display='grid' width='100%' gridTemplateColumns='1fr 1fr 1fr 1fr' gridGap='scale300'>
                                <Button kind='secondary' size='mini' onClick={() => window.open(`/discussions/apps/${data.id}/channels/${channel.id}`)}>查看</Button>
                                <Button kind='secondary' size='mini' onClick={() => { setForm({ ...channel }); setModeratorIds(''); setIsOpenModeratorModal(true); }}>版主</Button>
                                <Button kind='secondary' size='mini' onClick={() => { setForm({ ...channel }); setIsOpenEditModal(true); }}>修改</Button>
                                <Button kind='secondary' size='mini' onClick={() => { setForm({ ...channel }); setTransferChannel([dataList.filter(channel => channel.id !== form.id)[0]]); setIsOpenDeleteModal(true); }}>删除</Button>
                            </Block>
                        </div>
                    ))}
                    <div className={css({
                        display: 'flex', alignItems: 'center', justifyContent: 'center', width: '240px', height: '108px',
                        cursor: 'pointer', position: 'relative', padding: theme.sizing.scale300,
                        backgroundColor: theme.colors.backgroundSecondary, color: theme.colors.contentTertiary,
                        borderRadius: theme.borders.radius300, textDecoration: 'none',
                        ':hover': {
                            color: theme.colors.contentSecondary,
                        }
                    })} onClick={() => {
                        setForm({ name: '', description: '', icon: '' });
                        setIsOpenEditModal(true);
                    }}>
                        <Plus size='scale900' />
                    </div>
                </Block>
            }

            <Modal onClose={() => setIsOpenModeratorModal(false)} closeable={false} isOpen={isOpenModeratorModal} animate autoFocus role={ROLE.dialog}>
                <ModalHeader>设置版主</ModalHeader>
                <ModalBody>
                    <Block display='flex' flexDirection='column' gridGap='scale300'>
                        <FormControl label={<LabelSmall>用户ID</LabelSmall>} caption={'用","隔开多个用户ID，例如：1,2,3'}>
                            <Input size='compact' value={moderatorIds} onChange={e => setModeratorIds(e.target.value)} required></Input>
                        </FormControl>
                        <Block display='flex' gridGap='scale300' alignItems='center' flexWrap width='100%'>
                            {isLoadingModerator && <Spinner $size='scale1600' $borderWidth='scale300' $color='primary' />}
                            {moderators?.map((moderator, index) => (
                                <Tag key={index} closeable={true} onCloseClick={() => handleDeleteModerator(moderator.id)}>{moderator.name}</Tag>
                            ))}
                        </Block>
                    </Block>
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenModeratorModal(false)}>关闭</ModalButton>
                    <ModalButton onClick={() => handleSaveModerator()} isLoading={isSavingModerator}>确定</ModalButton>
                </ModalFooter>
            </Modal>

            <Modal onClose={() => setIsOpenEditModal(false)} closeable={false} isOpen={isOpenEditModal} animate autoFocus role={ROLE.dialog}>
                <ModalHeader>新增</ModalHeader>
                <ModalBody>
                    <FormControl label={<LabelSmall>名称</LabelSmall>} caption={'最少一个字'}>
                        <Input size='compact' required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}></Input>
                    </FormControl>
                    <FormControl label={<LabelSmall>图标</LabelSmall>} caption={'非必需'}>
                        <Input size='compact' value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}></Input>
                    </FormControl>
                    <FormControl label={<LabelSmall>描述</LabelSmall>} caption={'非必需'}>
                        <Input size='compact' value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></Input>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenEditModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleSave()} isLoading={isSubmitting}>确定</ModalButton>
                </ModalFooter>
            </Modal>

            <Modal onClose={() => setIsOpenDeleteModal(false)} closeable={false} isOpen={isOpenDeleteModal} animate autoFocus role={ROLE.dialog}>
                <ModalHeader>删除 {form.name}</ModalHeader>
                <ModalBody>
                    <FormControl label={<LabelSmall>选择一个频道进行转移</LabelSmall>} caption={'如果只剩下一个频道，且频道中还有讨论，则无法被删除'}>
                        <Select placeholder='' size='compact' clearable={false}
                            options={dataList.filter(channel => channel.id !== form.id)}
                            labelKey='name' valueKey='id'
                            onChange={params => setTransferChannel(params.value)}
                            value={transferChannel} />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenDeleteModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleDelete()} isLoading={isDeleting}>确定</ModalButton>
                </ModalFooter>
            </Modal>
        </Block>
    );
}

export default AppDetailDiscussions;