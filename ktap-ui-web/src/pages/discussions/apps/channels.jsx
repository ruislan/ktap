import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Input } from 'baseui/input';
import { Skeleton } from 'baseui/skeleton';
import { FormControl } from 'baseui/form-control';
import { LabelLarge, LabelSmall, ParagraphSmall } from 'baseui/typography';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';

import { Message3, ChatAlt2, Settings } from '@ktap/components/icons';
import Notification from '@ktap/components/notification';
import { Messages } from '@ktap/libs/utils';

function Setting({ appId, channel, afterUpdated = () => { } }) {
    const [, theme] = useStyletron();
    const navigate = useNavigate();
    const [isOpenChannelSettingModal, setIsOpenChannelSettingModal] = React.useState(false);
    const [settingForm, setSettingForm] = React.useState(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitErrorMessage, setSubmitErrorMessage] = React.useState(null);

    const handleChannelSettingSubmit = async () => {
        setIsSubmitting(true);
        setSubmitErrorMessage(null);
        try {
            const res = await fetch(`/api/discussions/apps/${appId}/channels/${channel.id}`, {
                method: 'PUT',
                body: JSON.stringify(settingForm),
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                setIsOpenChannelSettingModal(false);
                afterUpdated({ ...settingForm });
            } else {
                if (res.status === 400) {
                    const json = await res.json();
                    setSubmitErrorMessage(json.message);
                } else if (res.status === 401) {
                    navigate(`/login?from=${location.pathname}`);
                } else {
                    setSubmitErrorMessage(Messages.unknownError);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Block display='flex' alignItems='center' position='absolute' color='primary300' right='scale300' title='设置' overrides={{
            Block: {
                style: {
                    cursor: 'pointer',
                    ':hover': { color: theme.colors.primary100 },
                }
            }
        }} onClick={e => {
            e.preventDefault();
            setIsOpenChannelSettingModal(true);
            setSettingForm({ id: channel.id, name: channel.name, icon: channel.icon, description: channel.description });
        }}>
            <Settings width='20px' height='20px' />
            <Modal onClose={() => setIsOpenChannelSettingModal(false)} closeable={false} isOpen={isOpenChannelSettingModal} role={ROLE.alertdialog} animate autoFocus>
                <ModalHeader>设置频道</ModalHeader>
                <ModalBody>
                    <Block display='flex' flexDirection='column'>
                        {submitErrorMessage && <Block><Notification kind='negative' message={submitErrorMessage} /></Block>}
                        <FormControl label={<LabelSmall>名称</LabelSmall>} caption={'最少一个字'}>
                            <Input size='compact' required value={settingForm?.name} onChange={e => setSettingForm({ ...settingForm, name: e.target.value })}></Input>
                        </FormControl>
                        <FormControl label={<LabelSmall>图标</LabelSmall>} caption={'非必需'}>
                            <Input size='compact' value={settingForm?.icon} onChange={e => setSettingForm({ ...settingForm, icon: e.target.value })}></Input>
                        </FormControl>
                        <FormControl label={<LabelSmall>描述</LabelSmall>} caption={'非必需'}>
                            <Input size='compact' value={settingForm?.description} onChange={e => setSettingForm({ ...settingForm, description: e.target.value })}></Input>
                        </FormControl>
                    </Block>
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenChannelSettingModal(false)}>关闭</ModalButton>
                    <ModalButton isLoading={isSubmitting} onClick={() => handleChannelSettingSubmit()}>保存</ModalButton>
                </ModalFooter>
            </Modal>
        </Block>
    );
}

export default function Channels() {
    const { appId, channelId = 1 } = useParams();
    const [css, theme] = useStyletron();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = React.useState(true);
    const [dataList, setDataList] = React.useState([]);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/discussions/apps/${appId}/channels`);
                if (res.ok) {
                    const json = await res.json();
                    const allDiscussionCount = json?.data?.reduce((count, channel) => count + channel.meta.discussions, 0);
                    setDataList([{ id: 0, name: '全部讨论', description: '最近发布或有回复的所有讨论', meta: { discussions: allDiscussionCount } }, ...json.data]);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [appId]);

    return (
        <Block width='100%' display='flex' position='relative' flexDirection='column' gridGap='scale300'>
            <LabelLarge>频道</LabelLarge>
            {isLoading && <Skeleton width='100%' rows={3} height='144px' animation overrides={{ Row: { style: { height: '40px', borderRadius: theme.sizing.scale300 } } }} />}
            {dataList?.map((channel, index) => {
                const isActive = channel.id == channelId;
                return (<Link key={index} className={css({
                    display: 'flex', flexDirection: 'column', gap: theme.sizing.scale300, overflow: 'hidden',
                    cursor: 'pointer', position: 'relative', padding: theme.sizing.scale300,
                    backgroundColor: isActive ? theme.colors.backgroundTertiary : theme.colors.backgroundSecondary,
                    borderRadius: theme.borders.radius300, textDecoration: 'none', color: 'inherit',
                    boxShadow: isActive ? theme.lighting.shadow700 : 'unset',
                    ':hover': {
                        backgroundColor: theme.colors.backgroundTertiary,
                        boxShadow: theme.lighting.shadow700,
                    },
                })} to={`/discussions/apps/${appId}/channels/${channel.id}`}>
                    <Block display='flex' alignItems='center' gridGap='scale300'>
                        {channel.icon
                            ? <img src={channel.icon} className={css({ objectFit: 'cover', borderRadius: theme.borders.radius300, width: theme.sizing.scale800, height: theme.sizing.scale800 })} alt={channel.name} />
                            : <div className={css({
                                borderRadius: theme.borders.radius300, width: theme.sizing.scale800, height: theme.sizing.scale800,
                            })} title={channel.name}>
                                <ChatAlt2 solid />
                            </div>
                        }
                        <LabelSmall color={isActive ? '' : 'primary100'}>{channel.name}</LabelSmall>
                    </Block>
                    {isActive && channelId > 0 && <Setting appId={appId} channel={channel} afterUpdated={(data) => {
                        setDataList(prev => {
                            const index = prev.findIndex(channel => channel.id == data.id);
                            prev[index] = { ...prev[index], ...data };
                            return [...prev];
                        });
                    }} />}
                    {isActive && (<ParagraphSmall marginTop='scale0' marginBottom='scale0' color='primary300'>{channel.description}</ParagraphSmall>)}
                    {isActive && (
                        <Block display='flex' alignItems='center' justifyContent='space-between' overflow='hidden'>
                            <Block display='flex' alignItems='center'>
                                <Block display='flex' alignItems='center' gridGap='scale200' marginRight='scale900'>
                                    <Message3 width='20px' height='20px' />
                                    <LabelSmall color='primary300'>
                                        {channel.meta?.discussions || 0} 个讨论
                                    </LabelSmall>
                                </Block>
                                {channelId > 0 &&
                                    <Block display='flex' alignItems='center' gridGap='scale200'>
                                        <Block display='flex' alignItems='center' gridGap='scale0'>
                                            {channel.moderators?.slice(0, 5).map((moderator, index) => (
                                                <div key={index} title={moderator.name}
                                                    className={css({ display: 'flex', alignItems: 'center', justifyContent: 'center' })}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate(`/users/${moderator.id}`);
                                                    }}

                                                >
                                                    <img alt={moderator.name}
                                                        className={css({ borderRadius: theme.borders.radius300, })}
                                                        src={moderator.avatar} width='20px' height='20px' />
                                                </div>
                                            ))}
                                        </Block>
                                        <LabelSmall color='primary300'>
                                            {channel.moderators?.length === 0 ? '暂无版主' : `${channel.moderators?.length}位版主`}
                                        </LabelSmall>
                                    </Block>
                                }
                            </Block>
                        </Block>
                    )}
                </Link>);
            })}
        </Block>
    );
}