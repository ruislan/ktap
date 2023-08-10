import React from 'react';

import { Block } from 'baseui/block';
import { useSearchParams } from 'react-router-dom';
import AdminPanelReviews from './reviews';
import AdminPanelReviewComments from './comments';
import RoundTab from '../../../components/round-tab';


export default () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = React.useState(0);

    React.useEffect(() => {
        setActiveTab(searchParams.get('tab') || 0);
    }, [searchParams]);

    return (
        <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600'>
            <Block display='flex' alignItems='center' marginBottom='scale600'>
                <RoundTab activeKey={activeTab} names={['评测列表', '回复列表']} onChange={(e) => setActiveTab(e.activeKey)} />
            </Block>
            {activeTab === 0 && <AdminPanelReviews />}
            {activeTab === 1 && <AdminPanelReviewComments />}
        </Block>
    );
}