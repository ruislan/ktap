import React, { Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Block } from 'baseui/block';
import { Skeleton } from 'baseui/skeleton';
import { MOBILE_BREAKPOINT, LAYOUT_LEFT, LAYOUT_RIGHT } from '../../constants';
import RoundTab from '../../components/round-tab';

const TabActivities = lazy(() => import('./tab-activities'));
const TabReviews = lazy(() => import('./tab-reviews'));
const TabReviewComments = lazy(() => import('./tab-review-comments'));
const TabDiscussions = lazy(() => import('./tab-discussions'));
const TabDiscussionPosts = lazy(() => import('./tab-discussion-posts'));
const TabFollowApps = lazy(() => import('./tab-follow-apps'));
const TabFollowUsers = lazy(() => import('./tab-follow-users'));
const UserProfile = lazy(() => import('./user-profile'));

function UserContent({ theUser }) {
    const [activeTab, setActiveTab] = React.useState(0);
    return (
        <>
            <Block display='flex' alignItems='center' marginBottom='scale600'>
                <RoundTab activeKey={activeTab}
                    onChange={(e) => setActiveTab(e.activeKey)}
                    names={['活动', '评测', '评测回复', '讨论', '讨论发帖', '关注游戏', '关注用户']}
                />
            </Block>
            <Block paddingLeft='scale300' paddingRight='scale300' paddingBottom='scale300'>
                <Suspense>
                    {activeTab === 0 && theUser && <TabActivities theUser={theUser} />}
                    {activeTab === 1 && theUser && <TabReviews theUser={theUser} />}
                    {activeTab === 2 && theUser && <TabReviewComments theUser={theUser} />}
                    {activeTab === 3 && theUser && <TabDiscussions theUser={theUser} />}
                    {activeTab === 4 && theUser && <TabDiscussionPosts theUser={theUser} />}
                    {activeTab === 5 && theUser && <TabFollowApps theUser={theUser} />}
                    {activeTab === 6 && theUser && <TabFollowUsers theUser={theUser} />}
                </Suspense>
            </Block>
        </>
    );
}

function User() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [theUser, setTheUser] = React.useState(null);
    const [theUserMeta, setTheUserMeta] = React.useState(null);

    React.useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/users/${id}`);
                if (res.ok) {
                    const json = await res.json();
                    setTheUser(json.data);
                    setTheUserMeta(json.meta);
                } else {
                    throw { status: res.status };
                }
            } catch (error) {
                if (error?.status === 404) navigate('/', { replace: true });
                else navigate('/not-work');
            }
        })();
    }, [id, navigate]);

    return (
        <Block overrides={{
            Block: {
                style: ({ $theme }) => ({
                    marginTop: $theme.sizing.scale900,
                    display: 'flex',
                    justifyContent: 'center',
                    [MOBILE_BREAKPOINT]: {
                        marginTop: $theme.sizing.scale600,
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                    },
                })
            }
        }}>
            <Block width={LAYOUT_LEFT} margin={'0 8px 0 0'} overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            margin: '0',
                            padding: $theme.sizing.scale300,
                            maxWidth: '100vw',
                            gridArea: '2 / 1',
                        }
                    })
                }
            }}>
                <UserContent theUser={theUser} />
            </Block>
            <Block width={LAYOUT_RIGHT} margin={'0 0 0 8px'}
                overrides={{
                    Block: {
                        style: {
                            [MOBILE_BREAKPOINT]: {
                                width: 'auto',
                                marginRight: '8px',
                            },
                        }
                    }
                }}
            >
                <Suspense fallback={<Skeleton width="100%" height="410px" animation />}>
                    <UserProfile theUser={theUser} theUserMeta={theUserMeta} />
                </Suspense>
            </Block>
        </Block>
    );
}

export default User;