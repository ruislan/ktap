import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { Search } from "baseui/icon";
import { Button } from "baseui/button";
import { Input } from "baseui/input";
import { LabelMedium, LabelSmall } from "baseui/typography";
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';

import { DateTime, Messages, PAGE_LIMIT_NORMAL } from "@ktap/libs/utils";
import { useAuth } from "@ktap/hooks/use-auth";
import LoadMore from "@ktap/components/load-more";
import SplitBall from "@ktap/components/split-ball";
import Editor from "@ktap/components/editor";
import Notification from "@ktap/components/notification";
import RouterLink from "@ktap/components/router-link";
import { Lock, Message4, Pin, Reply, Gift2 } from "@ktap/components/icons";


export default function Discussions() {
    const limit = PAGE_LIMIT_NORMAL;
    const { appId, channelId = 0 } = useParams();
    const [css, theme] = useStyletron();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(true);
    const [discussions, setDiscussions] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const [isOpenEditorModal, setIsOpenEditorModal] = React.useState(false);
    const [keyword, setKeyword] = React.useState('');

    // editor
    const [editorContent, setEditorContent] = React.useState('');
    const [editorTitle, setEditorTitle] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [canSubmit, setCanSubmit] = React.useState(false);
    const [submitErrorMessage, setSubmitErrorMessage] = React.useState(null);
    // editor end

    const handleDiscussionSubmit = async () => {
        setIsSubmitting(true);
        setSubmitErrorMessage(null);
        try {
            const res = await fetch(`/api/discussions`, {
                method: 'POST',
                body: JSON.stringify({ title: editorTitle, content: editorContent, appId, channelId, }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setIsOpenEditorModal(false);
                fetchDiscussions();
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

    const fetchDiscussions = React.useCallback(async (keyword = '', skip = 0) => {
        try {
            setIsLoading(true);
            setSkip(skip);
            setKeyword(keyword);
            const res = await fetch(`/api/discussions/apps/${appId}/channels/${channelId}?keyword=${keyword}&skip=${skip}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                setDiscussions(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                setHasMore(json.skip + json.limit < json.count);
            }
        } finally {
            setIsLoading(false);
        }
    }, [appId, channelId, limit]);

    React.useEffect(() => {
        fetchDiscussions();
    }, [fetchDiscussions]);

    React.useEffect(() => {
        if (!isOpenEditorModal) {
            setEditorContent('');
            setEditorTitle('');
            setSubmitErrorMessage(null);
        }
    }, [isOpenEditorModal]);

    return (
        <Block display='flex' flexDirection='column' width='100%'>
            <Block display='flex' alignItems='center' justifyContent='space-between' marginBottom='scale600'>
                {channelId > 0 ? (user ? <Button size='compact' kind='secondary' onClick={() => setIsOpenEditorModal(true)}>发起新讨论</Button> :
                    <Button size='compact' kind='secondary' onClick={e => {
                        e.preventDefault();
                        navigate(`/login?from=${location.pathname}`);
                    }}>登录</Button>) : <Block></Block>}
                <Block display='flex' alignItems='center' gridGap='scale300'>
                    <Input value={keyword} size='compact' placeholder='搜索' onChange={e => setKeyword(e.target.value)} onKeyUp={e => e.key === 'Enter' && fetchDiscussions(keyword)} />
                    <Button size='compact' kind='secondary' onClick={() => fetchDiscussions(keyword)}><Search /></Button>
                </Block>
                <Modal onClose={() => setIsOpenEditorModal(false)} closeable={false} isOpen={isOpenEditorModal} role={ROLE.alertdialog} animate autoFocus>
                    <ModalHeader>发起新讨论</ModalHeader>
                    <ModalBody>
                        <Block display='flex' flexDirection='column'>
                            {submitErrorMessage && <Block><Notification kind='negative' message={submitErrorMessage} /></Block>}
                            <Block marginBottom='scale600'><Input size='compact' placeholder='弄个标题吧' value={editorTitle} onChange={e => setEditorTitle(e.target.value)} /></Block>
                            <Editor onUpdate={({ editor }) => {
                                setEditorContent(editor.getHTML());
                                setCanSubmit(editor.getText().length > 0 && editorTitle.length > 0);
                            }} />
                        </Block>
                    </ModalBody>
                    <ModalFooter>
                        <ModalButton kind='tertiary' onClick={() => setIsOpenEditorModal(false)}>关闭</ModalButton>
                        <ModalButton disabled={!canSubmit} onClick={() => handleDiscussionSubmit()} isLoading={isSubmitting}>发送</ModalButton>
                    </ModalFooter>
                </Modal>
            </Block>
            {discussions?.map((discussion, index) => {
                return (
                    <RouterLink key={index} href={`/discussions/${discussion.id}`}>
                        <Block display='flex' gridGap='scale300' width='100%' paddingTop='scale400' paddingBottom='scale400' overrides={{
                            Block: {
                                style: {
                                    borderBottomColor: theme.borders.border300.borderColor,
                                    borderBottomWidth: theme.borders.border300.borderWidth,
                                    borderBottomStyle: theme.borders.border300.borderStyle,
                                }
                            }
                        }}>
                            <img className={css({ borderRadius: theme.borders.radius300, marginTop: theme.sizing.scale0 })} src={discussion?.user?.avatar} width='36px' height='36px' />
                            <Block display='flex' flexDirection='column' overflow='hidden'>
                                <LabelMedium marginBottom='scale200'>{discussion?.title}</LabelMedium>
                                <Block display='flex' alignItems='center' color='primary300' flexWrap>
                                    <LabelSmall whiteSpace='nowrap' color='inherit'>{discussion?.channel?.name}</LabelSmall>
                                    <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                    {discussion.isSticky &&
                                        <>
                                            <Pin width='16px' height='16px' />
                                            <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                        </>
                                    }
                                    {discussion.isClosed &&
                                        <>
                                            <Lock width='16px' height='16px' />
                                            <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                        </>
                                    }
                                    {discussion?.meta?.posts > 0 &&
                                        <>
                                            <Block display='flex' alignItems='center' gridGap='scale0' color='inherit'>
                                                <Message4 width='16px' height='16px' />
                                                <LabelSmall color='inherit'>{discussion?.meta?.posts || 0}</LabelSmall>
                                            </Block>
                                            <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                        </>
                                    }
                                    {discussion?.meta?.gifts > 0 &&
                                        <>
                                            <Block display='flex' alignItems='center' gridGap='scale0' color='inherit'>
                                                <Gift2 width='16px' height='16px' />
                                                <LabelSmall color='inherit'>{discussion?.meta?.gifts || 0}</LabelSmall>
                                            </Block>
                                            <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                        </>
                                    }
                                    <LabelSmall whiteSpace='nowrap' color='inherit' display='flex' alignItems='center' gridGap='scale0'>
                                        {discussion?.lastPost?.user?.name && <Reply width='16px' height='16px' />}
                                        @{discussion?.lastPost?.user ? discussion?.lastPost?.user.name : discussion?.user?.name}
                                    </LabelSmall>
                                    <SplitBall color='rgb(151, 151, 151)' gap='6px' />
                                    <LabelSmall whiteSpace='nowrap' color='inherit'>{DateTime.fromNow(discussion?.createdAt)}</LabelSmall>
                                </Block>
                            </Block>
                        </Block>
                    </RouterLink>
                );
            })}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='56px' onClick={() => fetchDiscussions(keyword, skip + limit)} />
        </Block>
    );
}