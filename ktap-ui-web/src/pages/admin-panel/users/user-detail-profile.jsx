import React from 'react';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import { LabelXSmall, LabelSmall } from 'baseui/typography';
import { FormControl } from 'baseui/form-control';
import { Select } from 'baseui/select';
import { Textarea } from 'baseui/textarea';
import { useSnackbar } from 'baseui/snackbar';
import { Check, Delete } from 'baseui/icon';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';

import { Gender } from '@ktap/libs/utils';
import AvatarSquare from '@ktap/components/avatar-square';

function UserDetailProfile({ data, onChanged }) {
    const { enqueue } = useSnackbar();
    const [gender, setGender] = React.useState([{ id: data.gender || 'MAN' }]);
    const [bio, setBio] = React.useState(data.bio || '');
    const [location, setLocation] = React.useState(data.location || '');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);

    const handleSaveUser = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/users/${data.id}/profile`, {
                method: 'PUT',
                body: JSON.stringify({ gender: gender[0].id, bio, location, }),
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

    const handleDeleteAvatar = async () => {
        try {
            setIsDeleting(true);
            const res = await fetch(`/admin/users/${data.id}/avatar`, { method: 'PUT' });
            if (res.ok) {
                enqueue({ message: '删除成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                if (onChanged) onChanged();
            } else {
                enqueue({ message: '删除失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsDeleting(false);
            setIsOpenDeleteConfirmModal(false);
        }
    }
    return (
        <Block display='flex' flexDirection='column' overrides={{
            Block: {
                style: {
                    overflowWrap: 'normal',
                }
            }
        }}>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveUser();
            }}>
                <Block display='flex' flexDirection='column' gridGap='scale300' marginBottom='scale900'>
                    <Block display='flex' justifyContent='flex-start'>
                        <AvatarSquare name={data?.name} size='128px' src={data?.avatar} />
                    </Block>
                    <Block marginTop='scale300' display='flex' alignItems='center' justifyContent='flex-start'>
                        <Button onClick={(e) => {
                            e.preventDefault();
                            setIsOpenDeleteConfirmModal(true);
                        }} kind='secondary' size='compact' type='button' isLoading={isDeleting}>
                            重置头像
                        </Button>
                    </Block>
                    <LabelXSmall>注意重置头像将立即生效，并且将头像重置为一个随机的Dicebear头像图片</LabelXSmall>
                </Block>
                <FormControl label={<LabelSmall>性别</LabelSmall>}>
                    <Select
                        options={Gender.options}
                        size='compact'
                        clearable={false}
                        backspaceRemoves={false}
                        onChange={options => setGender(options.value)}
                        value={gender}
                    />
                </FormControl>
                <FormControl label={<LabelSmall>简介</LabelSmall>} counter={{ length: bio.length, maxLength: 255 }}>
                    <Textarea size='compact' value={bio} error={bio > 255} onChange={e => setBio(e.target.value)} />
                </FormControl>
                <FormControl label={<LabelSmall>地址</LabelSmall>} counter={{ length: location.length, maxLength: 100 }}>
                    <Input size='compact' value={location || ''} error={location.length > 100} onChange={e => setLocation(e.target.value)} />
                </FormControl>
                <Block display='flex'>
                    <Block><Button kind='secondary' size='compact' type='submit' isLoading={isLoading}>保存</Button></Block>
                </Block>
            </form>
            <Modal onClose={() => setIsOpenDeleteConfirmModal(false)}
                closeable={false}
                isOpen={isOpenDeleteConfirmModal}
                animate
                autoFocus
                role={ROLE.alertdialog}
            >
                <ModalHeader>是否重置头像</ModalHeader>
                <ModalBody>您确定要重置该用户头像吗？确定重置头像将删除该用户当前头像，并且重置为一个随机的<b>Dicebear</b>头像图片。该操作<b>不能撤消</b>。</ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenDeleteConfirmModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleDeleteAvatar()} isLoading={isLoading}>确定</ModalButton>
                </ModalFooter>
            </Modal>
        </Block>
    );
}

export default UserDetailProfile;