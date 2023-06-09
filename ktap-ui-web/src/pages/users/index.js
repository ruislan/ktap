import React from 'react';
import { Block } from 'baseui/block';
import { Tabs, Tab } from 'baseui/tabs-motion';
import { Skeleton } from 'baseui/skeleton';
import { MOBILE_BREAKPOINT, LAYOUT_LEFT, LAYOUT_RIGHT } from '../../constants';
import UserProfile from './user-profile';
import TabActivities from './tab-activities';
import TabReviews from './tab-reviews';
import TabReviewComments from './tab-review-comments';
import TabFollowApps from './tab-follow-apps';
import TabFollowUsers from './tab-follow-users';
import TabDiscussions from './tab-discussions';
import TabDiscussionPosts from './tab-discussion-posts';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';

function User() {
    const [searchParams] = useSearchParams();
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState(null);
    const [theUser, setTheUser] = React.useState(null);
    const [theUserMeta, setTheUserMeta] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/users/${id}`);
                if (res.ok) {
                    const json = await res.json();
                    setTheUser(json.data);
                    setTheUserMeta(json.meta);
                } else {
                    throw new Error({ status: res.status });
                }
            } catch (error) {
                if (error?.status === 404) navigate('/not-found', { replace: true });
                navigate('/not-work');
            } finally {
                setIsLoading(false);
            }
        })();
        setActiveTab(searchParams.get('tab') || 'activities');
    }, [id, searchParams, navigate]);

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
                <Tabs activeKey={activeTab} onChange={({ activeKey }) => setActiveTab(activeKey)} activateOnFocus>
                    <Tab title="活动" key='activities' overrides={{ Tab: { style: { whiteSpace: 'noWrap' } } }}><TabActivities theUser={theUser} /></Tab>
                    <Tab title="评测" key='reviews' overrides={{ Tab: { style: { whiteSpace: 'noWrap' } } }}><TabReviews theUser={theUser} /></Tab>
                    <Tab title="评测回复" key='review-comments' overrides={{ Tab: { style: { whiteSpace: 'noWrap' } } }}><TabReviewComments theUser={theUser} /></Tab>
                    <Tab title="讨论" key='discussions' overrides={{ Tab: { style: { whiteSpace: 'noWrap' } } }}><TabDiscussions theUser={theUser} /></Tab>
                    <Tab title="讨论发帖" key='discussion-posts' overrides={{ Tab: { style: { whiteSpace: 'noWrap' } } }}><TabDiscussionPosts theUser={theUser} /></Tab>
                    <Tab title="关注游戏" key='follow-apps' overrides={{ Tab: { style: { whiteSpace: 'noWrap' } } }}><TabFollowApps theUser={theUser} /></Tab>
                    <Tab title="关注用户" key='follow-users' overrides={{ Tab: { style: { whiteSpace: 'noWrap' } } }}><TabFollowUsers theUser={theUser} /></Tab>
                </Tabs>
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
                {isLoading ?
                    <Skeleton width="100%" height="410px" animation /> :
                    <UserProfile theUser={theUser} theUserMeta={theUserMeta} />
                }
            </Block>
        </Block>
    );
}

export default User;