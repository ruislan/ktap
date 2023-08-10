import React, { Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Block } from "baseui/block";
import { Skeleton } from 'baseui/skeleton';
import { LAYOUT_LEFT, LAYOUT_RIGHT, MOBILE_BREAKPOINT } from '../../constants';
import RoundTab from '../../components/round-tab';
import TabAppsList from './tab-apps-list';

const OrganizationProfile = React.lazy(() => import('./organization-profile'));
const OrganizationContact = React.lazy(() => import('./organization-contact'));

function OrganizationContent({ id }) {
    const [activeTab, setActiveTab] = React.useState(0);
    return (
        <>
            <Block display='flex' alignItems='center' marginBottom='scale600' >
                <RoundTab activeKey={activeTab}
                    onChange={(e) => setActiveTab(e.activeKey)}
                    names={['开发', '发行']}
                />
            </Block >
            <Block paddingLeft='scale300' paddingRight='scale300' paddingBottom='scale300'>
                {activeTab === 0 && <TabAppsList url={`/api/organizations/${id}/apps/developed`} />}
                {activeTab === 1 && <TabAppsList url={`/api/organizations/${id}/apps/published`} />}
            </Block>
        </>
    );
}

function Organization() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = React.useState(null);
    const [meta, setMeta] = React.useState(null);

    React.useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/organizations/${id}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json.data);
                    setMeta(json.meta);
                } else {
                    throw { status: res.status };
                }
            } catch (error) {
                if (error?.status === 404) navigate('/not-found', { replace: true });
                else navigate('/not-work');
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
                <OrganizationContent id={id} />
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
                <Suspense fallback={<Skeleton width="100%" height="364px" animation />}><OrganizationProfile data={data} meta={meta} /></Suspense>
                <Suspense fallback={<Block marginTop='scale900'><Skeleton width="100%" height="80px" animation /></Block>}><OrganizationContact data={data} /></Suspense>
            </Block>
        </Block>
    );
}

export default Organization;