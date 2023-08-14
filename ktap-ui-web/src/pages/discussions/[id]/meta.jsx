import React from 'react';

import { useNavigate } from 'react-router-dom';
import { Block } from 'baseui/block';
import { Input } from 'baseui/input';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { LabelSmall } from 'baseui/typography';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, ROLE } from 'baseui/modal';

import { useAuth } from '@ktap/hooks/use-auth';
import SideBox from '@ktap/components/side-box';
import { DateTime } from '@ktap/libs/utils';

export default function Meta({ discussion, onChange = () => { } }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoadingSticky, setIsLoadingSticky] = React.useState(false);
    const [isLoadingClose, setIsLoadingClose] = React.useState(false);
    const [isSticky, setIsSticky] = React.useState(discussion?.isSticky);
    const [isClosed, setIsClosed] = React.useState(discussion?.isClosed);

    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);

    const [isUpdating, setIsUpdating] = React.useState(false);
    const [isOpenUpdateModal, setIsOpenUpdateModal] = React.useState(false);
    const [title, setTitle] = React.useState(discussion?.title);

    const [operations, setOperations] = React.useState({ sticky: false, close: false, delete: false, update: false });

    const handleSticky = async ({ sticky }) => {
        setIsLoadingSticky(true);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}/sticky`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sticky })
            });
            if (res.ok) {
                setIsSticky(sticky);
                onChange({ sticky });
            }
        } finally {
            setIsLoadingSticky(false);
        }
    };

    const handleClose = async ({ close }) => {
        setIsLoadingClose(true);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}/close`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ close })
            });
            if (res.ok) {
                setIsClosed(close);
                onChange({ close });
            }
        } finally {
            setIsLoadingClose(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}`, { method: 'DELETE' });
            if (res.ok) {
                // back to channel
                navigate(`/discussions/apps/${discussion.app.id}/channels/${discussion.channel.id}`);
            }
        } finally {
            setIsDeleting(false);
            setIsOpenDeleteConfirmModal(false);
        }
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
            if (res.ok) {
                onChange({ title });
            }
        } finally {
            setIsUpdating(false);
            setIsOpenUpdateModal(false);
        }
    };

    React.useEffect(() => {
        const isModerator = discussion.channel.moderators.some(mId => mId == user?.id);
        const isAdmin = user && user.isAdmin;
        const isOwner = user && discussion?.user && user.id === discussion.user.id;
        setOperations({
            sticky: isAdmin || isModerator,
            close: isAdmin || isModerator || isOwner,
            delete: isAdmin || isModerator || isOwner,
            update: isAdmin || isModerator || isOwner,
        });
    }, [user, discussion]);
    return (
        <SideBox title='讨论信息'>
            <Block display='flex' flexDirection='column' paddingTop='0' paddingLeft='scale600' paddingRight='scale600' paddingBottom='scale600'>
                <Block display='grid' gridTemplateColumns='1fr 3fr' gridGap='scale300'>
                    <LabelSmall color='primary200'>发布日期</LabelSmall>
                    <LabelSmall color='primary'>{DateTime.formatCN(discussion.createdAt)}</LabelSmall>
                    <LabelSmall color='primary200'>贴子总数</LabelSmall>
                    <LabelSmall color='primary'>{discussion?.meta?.posts || 0}</LabelSmall>
                    <LabelSmall color='primary200'>参与人数</LabelSmall>
                    <LabelSmall color='primary'>{discussion?.meta?.users || 0}</LabelSmall>
                    <LabelSmall color='primary200'>礼物总数</LabelSmall>
                    <LabelSmall color='primary'>{discussion?.meta?.gifts || 0}</LabelSmall>
                </Block>
                <Block display='flex' alignItems='center' width='100%' marginTop='scale600' gridGap='scale300'>
                    {operations.sticky && !isSticky && <Button kind='secondary' size='compact' isLoading={isLoadingSticky} onClick={() => handleSticky({ sticky: true })}>置顶</Button>}
                    {operations.sticky && isSticky && <Button kind='secondary' size='compact' isLoading={isLoadingSticky} onClick={() => handleSticky({ sticky: false })}>取消置顶</Button>}
                    {operations.close && !isClosed && <Button kind='secondary' size='compact' isLoading={isLoadingClose} onClick={() => handleClose({ close: true })}>关闭</Button>}
                    {operations.close && isClosed && <Button kind='secondary' size='compact' isLoading={isLoadingClose} onClick={() => handleClose({ close: false })}>打开</Button>}
                    {operations.update && !isClosed && <Button kind='secondary' size='compact' onClick={() => { setIsOpenUpdateModal(true); setTitle(discussion.title); }}>编辑</Button>}
                    {operations.delete && <Button kind='secondary' size='compact' onClick={() => setIsOpenDeleteConfirmModal(true)}>删除</Button>}
                </Block>
            </Block>
            <Modal onClose={() => setIsOpenDeleteConfirmModal(false)} closeable={false} isOpen={isOpenDeleteConfirmModal}
                animate autoFocus role={ROLE.alertdialog}
            >
                <ModalHeader>是否删除讨论？</ModalHeader>
                <ModalBody>您确定要删除这个讨论吗？相关的帖子，以及帖子和礼物等将会一并删除。该操作<b>不能撤消</b>。</ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenDeleteConfirmModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleDelete()} isLoading={isDeleting}>确定</ModalButton>
                </ModalFooter>
            </Modal>
            <Modal onClose={() => setIsOpenUpdateModal(false)} closeable={false} isOpen={isOpenUpdateModal}
                animate autoFocus role={ROLE.alertdialog}
            >
                <ModalHeader>编辑讨论主题</ModalHeader>
                <ModalBody>
                    <FormControl label='主题'>
                        <Input value={title} onChange={e => setTitle(e.target.value)} />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenUpdateModal(false)}>取消</ModalButton>
                    <ModalButton disabled={title.length === 0} onClick={() => handleUpdate()} isLoading={isUpdating}>确定</ModalButton>
                </ModalFooter>
            </Modal>
        </SideBox>
    );
}