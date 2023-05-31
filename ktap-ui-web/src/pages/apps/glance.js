import React from 'react';
import dayjs from 'dayjs';

import { useStyletron } from 'baseui';
import { useNavigate } from 'react-router-dom';
import { Block } from 'baseui/block';
import { Tag } from 'baseui/tag';
import { Button } from 'baseui/button';
import { LabelSmall, LabelXSmall } from 'baseui/typography';
import { Check, Plus } from 'baseui/icon';
import { Modal, ModalBody, ModalHeader } from 'baseui/modal';
import { Input } from 'baseui/input';
import { MOBILE_BREAKPOINT, AppMedia } from '../../constants';
import { useAuth } from '../../hooks/use-auth';
import { Linux, Mac, Win } from '../../components/icons';
import RouterLink from '../../components/router-link';

function TagPlusEnhancer({ title = '添加', size = 16, onClick }) {
    const [css, theme] = useStyletron();
    return (<div className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.backgroundSecondary,
        color: theme.colors.backgroundInverseSecondary,
        borderRadius: '50%',
    })}
        onClick={onClick}>
        <Plus size={size} title={title} />
    </div>)
}

function Field({ label, value }) {
    return (<Block
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        paddingTop='scale300'
        gridGap='scale200'
        paddingBottom='scale300' overrides={{
            Block: {
                style: () => ({
                    borderBottomWidth: '1px',
                    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
                    borderBottomStyle: 'solid',
                })
            }
        }}>
        <Block color='primary400' whiteSpace='nowrap'>{label}</Block>
        <Block display='flex' alignItems='center' justifyContent='flex-end' gridGap='scale200' flexWrap>{value}</Block>
    </Block>);
}

function Glance({ data }) {
    const USER_TAG_LIMIT = 5;
    const APP_TAG_LIMIT = 5;
    const [css, theme] = useStyletron();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isFollowed, setIsFollowed] = React.useState(false);
    const [isOpenTagModal, setIsOpenTagModal] = React.useState(false);
    const [userTags, setUserTags] = React.useState([]);
    const [frequentTags, setFrequentTags] = React.useState([]);
    const [newTag, setNewTag] = React.useState('');

    const handleFollow = async () => {
        if (!user) { navigate('/login'); return; }
        await fetch(`/api/user/follows/apps/${data.id}`, { method: isFollowed ? 'DELETE' : 'POST', });
        setIsFollowed(prev => !prev);
    };
    React.useEffect(() => {
        const fetchFollow = async () => {
            if (user) {
                try {
                    const res = await fetch(`/api/user/follows/apps/${data.id}`);
                    if (res.ok) {
                        const json = await res.json();
                        setIsFollowed(json?.data?.follow);
                    }
                } catch (_) {
                    setIsFollowed(false);
                }
            }
        }
        fetchFollow();
    }, [user, data.id]);


    const fetchTags = React.useCallback(async () => {
        try {
            const res = await fetch(`/api/apps/${data.id}/tags/by-me`);
            if (res.ok) {
                const json = await res.json();
                setUserTags(json.data.current || []);
                setFrequentTags(json.data.frequent || []);
            }
        } catch (_) {
            setUserTags([]);
            setFrequentTags([]);
        }
    }, [data.id]);

    const handleSaveTag = async (tagName) => {
        if (!user) { navigate('/login'); return; }
        if (userTags.length < USER_TAG_LIMIT && tagName && tagName.length > 0) {
            const res = await fetch(`/api/apps/${data.id}/tags`, { method: 'POST', body: JSON.stringify({ name: tagName }), headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                await fetchTags();
                setNewTag('');
            }
        }
    };

    const handleDeleteTag = async (name) => {
        if (!user) { navigate('/login'); return; }
        const res = await fetch(`/api/apps/${data.id}/tags/${name}`, { method: 'DELETE' });
        if (res.ok) await fetchTags();
    };

    React.useEffect(() => {
        if (isOpenTagModal) fetchTags();
    }, [isOpenTagModal, fetchTags]);

    return (
        <>
            <Block padding='0' margin='0' height='151px'
                overrides={{
                    Block: {
                        style: {
                            [MOBILE_BREAKPOINT]: {
                                width: 'auto',
                                height: 'auto',
                            }
                        }
                    }
                }}
            >
                <img className={css({
                    width: '100%',
                    height: '100%',
                    borderRadius: theme.borders.radius300,
                    [MOBILE_BREAKPOINT]: {
                        borderRadius: 0,
                    }
                })}
                    src={data?.media?.filter(m => m.usage === AppMedia.usage.head)[0].image} />
            </Block>
            <Block overrides={{
                Block: {
                    style: {
                        [MOBILE_BREAKPOINT]: {
                            paddingLeft: theme.sizing.scale300,
                            paddingRight: theme.sizing.scale300,
                        }
                    }
                }
            }}
            >
                <Block marginTop='scale600' marginBottom='scale600' justifyContent='space-between' display='flex'>
                    <Block flex='1' display='flex' alignItems='center' flexWrap='wrap'>
                        {data?.tags?.slice(0, APP_TAG_LIMIT).map((tag, index) =>
                            <Tag key={index} closeable={false}><RouterLink href={`/tags/${tag.name}`}>{tag.name}</RouterLink></Tag>
                        )}
                        <Block marginLeft='scale100' display='inline-flex'>
                            <Button size='mini' kind='tertiary' shape='circle' onClick={() => user ? setIsOpenTagModal(true) : navigate('/login')}>
                                <Plus color='primary' size={20} />
                            </Button>
                            <Modal onClose={() => setIsOpenTagModal(false)} isOpen={isOpenTagModal} size='default' role='dialog'>
                                <ModalHeader>{data?.name} 的标签</ModalHeader>
                                <ModalBody>
                                    <Block display='flex' flexDirection='column'>
                                        <Block display='flex' flexDirection='column' marginTop='scale600'>
                                            <LabelSmall>热门标签</LabelSmall>
                                            <Block display='flex' flexWrap='wrap' marginTop='scale300'>
                                                {data.tags.map((tag, index) => (
                                                    <Tag key={index} variant='solid' size='small' closeable={false}
                                                        onClick={() => navigate(`/tags/${tag.name}`)}
                                                        startEnhancer={() => {
                                                            return userTags.length < USER_TAG_LIMIT && !userTags.find(ut => ut.name === tag.name) ?
                                                                <TagPlusEnhancer onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSaveTag(tag.name);
                                                                }} /> :
                                                                null;
                                                        }}
                                                    >
                                                        {tag.name}({tag.count})
                                                    </Tag>
                                                ))}
                                            </Block>
                                        </Block>
                                        {frequentTags.length > 0 &&
                                            <Block display='flex' flexDirection='column' marginTop='scale600'>
                                                <LabelSmall>你的常用</LabelSmall>
                                                <Block display='flex' flexWrap='wrap' marginTop='scale300'>
                                                    {frequentTags.map((tag, index) => (
                                                        <Tag key={index} variant='solid' size='small' closeable={false}
                                                            onClick={() => navigate(`/tags/${tag.name}`)}
                                                            startEnhancer={() => {
                                                                return userTags.length < USER_TAG_LIMIT && !userTags.find(ut => ut.name === tag.name) ?
                                                                    <TagPlusEnhancer onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSaveTag(tag.name);
                                                                    }} /> :
                                                                    null;
                                                            }}
                                                        >
                                                            {tag.name}({tag.count})
                                                        </Tag>
                                                    ))}
                                                </Block>
                                            </Block>
                                        }
                                        {userTags.length > 0 &&
                                            <Block display='flex' flexDirection='column' marginTop='scale600'>
                                                <LabelSmall>你的标签</LabelSmall>
                                                <Block display='flex' alignItems='baseline' marginTop='scale300' flexWrap='wrap'>
                                                    {userTags.map((tag, index) => (
                                                        <Tag key={index} variant='solid' size='small' onActionClick={(e) => {
                                                            e.preventDefault();
                                                            handleDeleteTag(tag.name);
                                                        }}>
                                                            {tag.name}
                                                        </Tag>
                                                    ))}
                                                </Block>
                                            </Block>
                                        }
                                        <Block display='flex' marginTop='scale900'>
                                            <Block flex='1'>
                                                <Input
                                                    value={newTag}
                                                    onChange={e => setNewTag(e.target.value)}
                                                    readOnly={userTags.length >= USER_TAG_LIMIT}
                                                    maxLength={10} size='compact'
                                                    placeholder={userTags.length < USER_TAG_LIMIT ? '输入标签,最长10字' : '最多只能添加5个标签'}
                                                    onKeyUp={e => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleSaveTag(newTag);
                                                        }
                                                    }}
                                                />
                                                <LabelXSmall marginTop='scale300' color='primary500'>小提醒：与游戏 <b>类型</b> 或 <b>功能</b> 相同的内容将不起作用哦</LabelXSmall>
                                            </Block>
                                            <Block marginLeft='scale300'>
                                                <Button size='compact' onClick={() => userTags.length < USER_TAG_LIMIT ? handleSaveTag(newTag) : setIsOpenTagModal(false)}>{userTags.length < USER_TAG_LIMIT ? '确定' : '关闭'}</Button>
                                            </Block>
                                        </Block>
                                    </Block>
                                </ModalBody>
                            </Modal>
                        </Block>
                    </Block>
                </Block>
                <Block display='flex' flexDirection='column' marginTop='scale600' marginBottom='scale600'>
                    <Button kind='secondary' onClick={() => handleFollow()} startEnhancer={isFollowed ? <Check size={20} /> : null}>
                        {isFollowed ? '已关注' : '关注'}
                    </Button>
                    <Block marginBottom='scale300' />
                    <Button kind='secondary' onClick={e => {
                        e.preventDefault();
                        window.open(`${data?.downloadUrl}`);
                    }}>下载</Button>
                </Block>
                <Block display='flex' flexDirection='column' color='primary200' font='font200' marginTop='scale600' marginBottom='scale600'>
                    <Field label='评分' value={data.score} />
                    <Field label='开发商' value={
                        data?.developers?.map((developer, index) =>
                            <LabelSmall key={index} color='primary200'><RouterLink href={`/organizations/${developer.id}`} kind='underline'>{developer.name}</RouterLink></LabelSmall>
                        )
                    } />
                    <Field label='发行商' value={
                        data?.publishers?.map((publisher, index) =>
                            <LabelSmall key={index} color='primary200'><RouterLink href={`/organizations/${publisher.id}`} kind='underline'>{publisher.name}</RouterLink></LabelSmall>
                        )
                    } />
                    <Field label='发行于' value={dayjs(data?.releasedAt).format('YYYY 年 M 月 D 日')} />
                    <Field label='平台' value={
                        data?.platforms?.map((platform, index) =>
                            <Block key={index} display='flex' alignItems='center' overrides={{ Block: { style: { ':first-child': { marginLeft: 0 } } } }} marginLeft='scale200'>
                                {
                                    (() => {
                                        switch (platform.os) {
                                            case 'Windows': return <Win width='20px' height='20px' />;
                                            case 'Macos': return <Mac width='20px' height='20px' />;
                                            case 'Linux': return <Linux width='20px' height='20px' />;
                                            case 'iOS': return <Apple width='20px' height='20px' />;
                                            case 'Android': return <Android width='20px' height='20px' />;
                                            default: return <></>;
                                        }
                                    })()
                                }
                                <Block marginLeft='scale0'>{platform.os}</Block>
                            </Block>
                        )
                    } />
                </Block>
            </Block>
        </>
    );
}

export default Glance;