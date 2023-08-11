import React from 'react';

import { Block } from 'baseui/block';
import { useSearchParams } from 'react-router-dom';

import RoundTab from '@ktap/components/round-tab';

import AdminPanelDiscussions from './discussions';
import AdminPanelPosts from './posts';

export default function DiscussionsLayout() {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = React.useState(0);

    React.useEffect(() => {
        setActiveTab(searchParams.get('tab') || 0);
    }, [searchParams]);

    return (
        <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600'>
            <Block display='flex' alignItems='center' marginBottom='scale600'>
                <RoundTab activeKey={activeTab} names={['讨论列表', '回复列表']} onChange={(e) => setActiveTab(e.activeKey)} />
            </Block>
            {activeTab === 0 && <AdminPanelDiscussions />}
            {activeTab === 1 && <AdminPanelPosts />}
        </Block>
    );
}