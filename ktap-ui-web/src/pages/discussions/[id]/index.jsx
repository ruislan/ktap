import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { HeadingXSmall, LabelSmall } from 'baseui/typography';

import { LAYOUT_DEFAULT_CONTENT, LAYOUT_DEFAULT, LAYOUT_DEFAULT_SIDE, MOBILE_BREAKPOINT } from '@ktap/libs/utils';
import RouterLink from '@ktap/components/router-link';
import { Lock, Pin } from '@ktap/components/icons';

import Posts from './posts';
import Meta from './meta';
import Others from './others';
import AppGlance from './app-glance';

export default function Discussion() {
    const { appId, id } = useParams();
    const [css, theme] = useStyletron();
    const navigate = useNavigate();
    const [discussion, setDiscussion] = React.useState({});
    const [isLoadingDiscussion, setIsLoadingDiscussion] = React.useState(true);

    React.useEffect(() => {
        if (id > 0) {
            (async () => {
                try {
                    setIsLoadingDiscussion(true);
                    const res = await fetch(`/api/discussions/${id}`);
                    if (res.ok) {
                        const json = await res.json();
                        setDiscussion(json.data);
                    } else {
                        throw { status: res.status };
                    }
                } catch (error) {
                    if (error?.status === 401 || error?.status === 403) navigate(`/login?from=${location.pathname}`);
                    else if (error?.status === 404) navigate('/discussions', { replace: true });
                    else navigate('/not-work');
                } finally {
                    setIsLoadingDiscussion(false);
                }
            })();
        }
    }, [id, navigate]);

    return (
        <Block display='flex' flexDirection='column' width={LAYOUT_DEFAULT} marginTop='scale900' maxWidth='100%' overflow='hidden'
            overrides={{
                Block: {
                    style: {
                        [MOBILE_BREAKPOINT]: {
                            marginTop: theme.sizing.scale600, paddingLeft: theme.sizing.scale300, paddingRight: theme.sizing.scale300,
                        }
                    }
                }
            }}>
            <Block display='flex' width='100%' alignItems='center' gridGap='scale300' marginBottom='scale800'>
                <RouterLink href={`/discussions/apps/${discussion?.app?.id}`} kind='underline'><LabelSmall>{discussion?.app?.name}</LabelSmall></RouterLink> /
                <RouterLink href={`/discussions/apps/${discussion?.app?.id}/channels/${discussion?.channel?.id}`} kind='underline'><LabelSmall>{discussion?.channel?.name}</LabelSmall></RouterLink> /
                <LabelSmall>讨论详情</LabelSmall>
            </Block>
            <Block display='flex' width='100%' backgroundColor='backgroundSecondary' padding='scale700'
                marginBottom='scale600'
                overrides={{
                    Block: { style: { borderRadius: theme.borders.radius300, boxShadow: theme.lighting.shadow500, } }
                }}
            >
                <HeadingXSmall margin='0' maxWidth='100%'>
                    {discussion.isClosed && (<div className={css({ display: 'inline-flex', float: 'left', marginTop: theme.sizing.scale0, marginRight: theme.sizing.scale0, color: theme.colors.primary200 })}><Lock width='24px' height='24px' /></div>)}
                    {discussion.isSticky && (<div className={css({ display: 'inline-flex', float: 'left', marginTop: theme.sizing.scale0, marginRight: theme.sizing.scale100, color: theme.colors.primary200 })}><Pin width='24px' height='24px' /></div>)}
                    {discussion.title}
                </HeadingXSmall>
            </Block>
            <Block display='flex' width='100%' overrides={{
                Block: { style: { [MOBILE_BREAKPOINT]: { flexDirection: 'column', gap: theme.sizing.scale900 } } }
            }}>
                <Block display='flex' flexDirection='column' width={LAYOUT_DEFAULT_CONTENT} marginRight='scale300' overrides={{
                    Block: { style: { [MOBILE_BREAKPOINT]: { width: '100%', marginRight: 0, } } }
                }}>
                    {!isLoadingDiscussion && <Posts discussion={discussion} />}
                </Block>
                <Block display='flex' flexDirection='column' width={LAYOUT_DEFAULT_SIDE} marginLeft='scale300' overrides={{
                    Block: { style: { [MOBILE_BREAKPOINT]: { width: '100%', marginLeft: 0, } } }
                }}>
                    {!isLoadingDiscussion && <Meta discussion={discussion} onChange={({ sticky, close, title }) => {
                        if (sticky !== undefined) setDiscussion(prev => ({ ...prev, isSticky: sticky }));
                        if (close !== undefined) setDiscussion(prev => ({ ...prev, isClosed: close }));
                        if (title !== undefined) setDiscussion(prev => ({ ...prev, title }));
                    }} />}
                    {!isLoadingDiscussion && <AppGlance app={discussion?.app} />}
                    {!isLoadingDiscussion && <Others appId={appId} discussionId={discussion.id} />}
                </Block>
            </Block>
        </Block>
    );
}