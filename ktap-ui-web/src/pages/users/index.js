import React, { Suspense, lazy } from 'react';
import { Block } from 'baseui/block';
import { Skeleton } from 'baseui/skeleton';
import { MOBILE_BREAKPOINT, LAYOUT_LEFT, LAYOUT_RIGHT } from '../../constants';
import { useParams, useNavigate } from 'react-router-dom';
import RoundTab from '../../components/round-tab';
import TabActivities from './tab-activities';
import TabReviews from './tab-reviews';
import TabReviewComments from './tab-review-comments';
import TabDiscussions from './tab-discussions';
import TabDiscussionPosts from './tab-discussion-posts';
import TabFollowApps from './tab-follow-apps';
import TabFollowUsers from './tab-follow-users';

const UserProfile = lazy(() => import('./user-profile'));

function User() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState(0);
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
                <Block display='flex' alignItems='center' marginBottom='scale600'>
                    <RoundTab activeKey={activeTab}
                        onChange={(e) => setActiveTab(e.activeKey)}
                        names={['活动', '评测', '评测回复', '讨论', '讨论发帖', '关注游戏', '关注用户']}
                    />
                </Block>
                <Block paddingLeft='scale300' paddingRight='scale300' paddingBottom='scale300'>
                    {activeTab === 0 && theUser && <TabActivities theUser={theUser} />}
                    {activeTab === 1 && theUser && <TabReviews theUser={theUser} />}
                    {activeTab === 2 && theUser && <TabReviewComments theUser={theUser} />}
                    {activeTab === 3 && theUser && <TabDiscussions theUser={theUser} />}
                    {activeTab === 4 && theUser && <TabDiscussionPosts theUser={theUser} />}
                    {activeTab === 5 && theUser && <TabFollowApps theUser={theUser} />}
                    {activeTab === 6 && theUser && <TabFollowUsers theUser={theUser} />}
                </Block>
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
                <Suspense fallback={<Skeleton width="100%" height="410px" animation />}><UserProfile theUser={theUser} theUserMeta={theUserMeta} /></Suspense>
            </Block>
        </Block>
    );
}

export default User;