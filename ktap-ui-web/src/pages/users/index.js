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
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';

function User() {
    const [searchParams] = useSearchParams();
    const { id } = useParams();
    const [activeTab, setActiveTab] = React.useState(null);
    const [theUser, setTheUser] = React.useState(null);
    const [theUserMeta, setTheUserMeta] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const navigate = useNavigate();

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
                    if (res.status === 404) navigate('/not-found', { replace: true });
                    if (res.status >= 500) navigate('/panic');
                }
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
                    <Tab title="活动" key='activities'><TabActivities theUser={theUser} /></Tab>
                    <Tab title="评测" key='reviews'><TabReviews theUser={theUser} /></Tab>
                    <Tab title="评测回复" key='review-comments'><TabReviewComments theUser={theUser} /></Tab>
                    <Tab title="关注游戏" key='follow-apps'><TabFollowApps theUser={theUser} /></Tab>
                    <Tab title="关注用户" key='follow-users'><TabFollowUsers theUser={theUser} /></Tab>
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
                {/* <UserAchievements /> */}
            </Block>
        </Block>
    );
}

export default User;