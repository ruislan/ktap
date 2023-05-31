import React from 'react';

import { Block } from "baseui/block";
import { Skeleton } from 'baseui/skeleton';
import { useNavigate, useParams } from 'react-router-dom';
import { LAYOUT_LEFT, LAYOUT_RIGHT, MOBILE_BREAKPOINT } from '../../constants';
import { Tabs, Tab } from 'baseui/tabs-motion';
import OrganizationProfile from './organization-profile';
import TabAppsList from './tab-apps-list';
import OrganizationContact from './organization-contact';

function Organization() {
    const { id } = useParams();
    const [isLoading, setIsLoading] = React.useState(true);
    const [data, setData] = React.useState(null);
    const [meta, setMeta] = React.useState(null);
    const [activeKey, setActiveKey] = React.useState('developed');
    const navigate = useNavigate();

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/organizations/${id}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json.data);
                    setMeta(json.meta);
                } else {
                    if (res.status === 404) navigate('/not-found', { replace: true });
                    if (res.status >= 500) navigate('/panic');
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [id, navigate]);
    return (
        <Block marginTop='scale900' display='flex' justifyContent='center' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    [MOBILE_BREAKPOINT]: {
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        marginTop: $theme.sizing.scale600,
                    }
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
                {/* 新闻/开发/发行 */}
                <Tabs activeKey={activeKey} onChange={({ activeKey }) => setActiveKey(activeKey)} activateOnFocus>
                    <Tab title="开发" key='developed'><TabAppsList url={`/api/organizations/${id}/apps/developed`} /></Tab>
                    <Tab title="发行" key='published'><TabAppsList url={`/api/organizations/${id}/apps/published`} /></Tab>
                </Tabs>
            </Block>
            <Block width={LAYOUT_RIGHT} margin={'0 0 0 8px'}
                overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            [MOBILE_BREAKPOINT]: {
                                width: 'auto',
                                marginLeft: $theme.sizing.scale300,
                                marginRight: $theme.sizing.scale300,
                            },
                        })
                    }
                }}
            >
                {isLoading ?
                    <Skeleton width="100%" height="410px" animation /> :
                    <>
                        <OrganizationProfile data={data} meta={meta} />
                        <OrganizationContact data={data} />
                    </>
                }
            </Block>
        </Block>
    );
}

export default Organization;