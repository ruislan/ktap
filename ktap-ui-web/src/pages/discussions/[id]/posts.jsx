import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { LabelMedium } from 'baseui/typography';

import Editor from '@ktap/components/editor';
import LoadMore from '@ktap/components/load-more';
import { useAuth } from '@ktap/hooks/use-auth';
import { PAGE_LIMIT_NORMAL } from '@ktap/libs/utils';
import '@ktap/assets/css/post.css';

import UserBar from './user-bar';
import PostBox from './post-box';

// 回复讨论的帖子直接追加到当前最后一贴的后面，如果用户点击“查看更多”，
// 后续的帖子中如果没有包含新帖，则保持该贴在最后一贴的后面。
// 后续的帖子中如果包含了新帖，则将这个保持在最后的帖子取消掉。
// XXX 新帖子在删除前，最好有个标志来标记它是新放进去的。
export default function Posts({ discussion }) {
    const limit = PAGE_LIMIT_NORMAL;
    const { user } = useAuth();
    const [, theme] = useStyletron();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const [dataList, setDataList] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);

    // editor
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [canSubmit, setCanSubmit] = React.useState(false);
    const [editor, setEditor] = React.useState();
    const [newPosts, setNewPosts] = React.useState([]);

    const handlePostSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/discussions/${discussion.id}/posts`, {
                method: 'POST',
                body: JSON.stringify({ content: editor.getHTML() }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                const json = await res.json();
                setNewPosts(prev => [...prev, {
                    ...json.data,
                    user, gifts: [], meta: { up: 0, downs: 0, gifts: 0 },
                }]);
                editor?.chain().focus().clearContent().run();
            } else {
                throw { status: res.status };
            }
        } catch (error) {
            if (error?.status === 401 || error?.status === 403) navigate(`/login?from=${location.pathname}`);
            else if (error?.status === 404) navigate('/not-found', { replace: true });
            else navigate('/not-work');
        } finally {
            setIsSubmitting(false);
        }
    };
    // editor end

    React.useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/discussions/${discussion.id}/posts?skip=${skip}&limit=${limit}`);
                if (res.ok) {
                    const json = await res.json();
                    if (user && json.data && json.data.length > 0) {
                        const effectRes = await fetch(`/api/user/effect/discussions/posts?ids=${json.data.map(v => v.id).join(',')}`);
                        const effectJson = await effectRes.json();
                        json.data.forEach(post => post.viewer = { direction: effectJson.data[post.id].thumb, reported: effectJson.data[post.id].reported });
                    }
                    setNewPosts(prev => prev.filter(newPost => !json.data.find(v => v.id === newPost.id)));
                    setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                    setHasMore(json.skip + json.limit < json.count);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [discussion.id, skip, limit, user]);

    return (
        <Block display='flex' flexDirection='column' gridGap='scale600'>
            {[...dataList, ...newPosts].map((post, index) => {
                return <PostBox
                    key={index} post={post} discussion={discussion}
                    onQuoteClick={() => {
                        if (!user) { navigate(`/login?from=${location.pathname}`); return; }
                        editor?.chain().focus().insertContent(`<blockquote>${post.content}</blockquote>`).run();
                    }}
                    afterUpdated={({ content, updatedAt }) => {
                        setNewPosts(prev => prev.map(v => v.id === post.id ? { ...v, content, updatedAt } : v));
                        setDataList(prev => prev.map(v => v.id === post.id ? { ...v, content, updatedAt } : v));
                    }}
                    afterReported={() => {
                        setNewPosts(prev => prev.map(v => v.id === post.id ? { ...v, viewer: { ...v.viewer, reported: true } } : v));
                        setDataList(prev => prev.map(v => v.id === post.id ? { ...v, viewer: { ...v.viewer, reported: true } } : v));
                    }}
                    afterThumbed={({ direction, ups, downs, }) => {
                        setNewPosts(prev => prev.map(v => v.id === post.id ? { ...v, meta: { ...v.meta, ups, downs }, viewer: { ...v.viewer, direction } } : v));
                        setDataList(prev => prev.map(v => v.id === post.id ? { ...v, meta: { ...v.meta, ups, downs }, viewer: { ...v.viewer, direction } } : v));
                    }}
                    afterSentGift={({ gifts, count }) => {
                        setNewPosts(prev => prev.map(v => v.id === post.id ? { ...v, gifts, meta: { ...prev.meta, gifts: count } } : v));
                        setDataList(prev => prev.map(v => v.id === post.id ? { ...v, gifts, meta: { ...prev.meta, gifts: count } } : v));
                    }}
                    afterDeleted={() => {
                        setNewPosts(prev => prev.filter(v => v.id !== post.id));
                        setDataList(prev => prev.filter(v => v.id !== post.id));
                    }}
                />
            })}
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='220px' onClick={() => setSkip(prev => prev + limit)} />
            {user && !discussion?.isClosed &&
                <Block marginTop='scale600' display='flex' flexDirection='column' backgroundColor='backgroundSecondary' padding='scale600' overrides={{
                    Block: { style: { borderRadius: theme.borders.radius300 } }
                }}>
                    <LabelMedium marginBottom='scale600'>回复</LabelMedium>
                    <Block display='flex' marginBottom='scale600'>
                        <UserBar id={user.id} name={user.name} avatar={user.avatar} title={user.title} gender={user.gender} />
                    </Block>
                    <Block display='flex' flexDirection='column'>
                        <Editor onCreate={({ editor }) => setEditor(editor)} onUpdate={({ editor }) => setCanSubmit(editor.getText().length > 0)} />
                        <Block marginTop='scale600' alignSelf='flex-end'>
                            <Button size='compact' disabled={!canSubmit} isLoading={isSubmitting} kind='secondary' onClick={() => handlePostSubmit()}>提交</Button>
                        </Block>
                    </Block>
                </Block>
            }
        </Block>
    );
}