import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';

import { useAuth } from '@ktap/hooks/use-auth';
import RouterLink from '@ktap/components/router-link';
import '@ktap/assets/css/post.css';

import PostBox from './post-box';

// 回复讨论的帖子直接追加到当前最后一贴的后面，如果用户点击“查看更多”，
// 后续的帖子中如果没有包含新帖，则保持该贴在最后一贴的后面。
// 后续的帖子中如果包含了新帖，则将这个保持在最后的帖子取消掉。
// XXX 新帖子在删除前，最好有个标志来标记它是新放进去的。
export default function Post({ discussion, postId }) {
    const { user } = useAuth();
    const [, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(false);
    const [post, setPost] = React.useState(null);
    React.useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/discussions/${discussion.id}/posts/${postId}`);
                if (res.ok) {
                    const json = await res.json();
                    if (user && json.data) {
                        const effectRes = await fetch(`/api/user/effect/discussions/posts?ids=${postId}`);
                        const effectJson = await effectRes.json();
                        json.data.viewer = { direction: effectJson.data[json.data.id].thumb, reported: effectJson.data[json.data.id].reported };
                    }
                    setPost(json.data);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [discussion.id, user, postId]);

    return (
        <Block display='flex' flexDirection='column' gridGap='scale600'>
            {!isLoading && post &&
                <PostBox discussion={discussion} post={post} isFirst={true} actions={{ thumb: true, gift: true, }}
                    afterThumbed={({ direction, ups, downs, }) => setPost(prev => ({
                        ...prev,
                        viewer: { ...prev.viewer, direction },
                        meta: { ...prev.meta, ups, downs },
                    }))}
                    afterSentGift={({ gifts, count }) => setPost(prev => ({
                        ...prev,
                        gifts,
                        meta: { ...prev.meta, gifts: count }
                    }))} />
            }
            <Block display='flex' width='100%' alignItems='center' justifyContent='center' backgroundColor='backgroundSecondary' padding='scale600'
                overrides={{
                    Block: { style: { borderRadius: theme.borders.radius300, boxShadow: theme.lighting.shadow500, } }
                }}
            >
                <RouterLink href={`/discussions/${discussion.id}`}>查看全部回帖</RouterLink>
            </Block>
        </Block>
    );
}