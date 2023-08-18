import React from 'react';
import { useParams } from 'react-router-dom';

import { Block } from 'baseui/block';
import { LabelSmall, HeadingSmall } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';

import AppDetailInfo from './app-detail-info';
import AppDetailMedia from './app-detail-media';
import AppDetailContact from './app-detail-contact';
import AppDetailTags from './app-detail-tags';
import AppDetailRequirements from './app-detail-requirements';
import AppDetailLanguages from './app-detail-languages';
import AppDetailActions from './app-detail-actions';
import AppDetailOrganizations from './app-detail-organizations';
import AppDetailProReviews from './app-detail-pro-reviews';
import AppDetailAwards from './app-detail-awards';
import AppDetailDiscussions from './app-detail-discussions';

import RouterLink from '@ktap/components/router-link';
import Tabs from '@ktap/components/tabs';

function AdminPanelAppDetail() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [data, setData] = React.useState(null);
    const fetchData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/apps/${id}`);
            if (res.ok) {
                const json = await res.json();
                setData(json.data);
            }
        } finally {
            setIsLoading(false);
        }
    }, [id]);
    React.useEffect(() => {
        fetchData();
    }, [fetchData]);
    return (
        <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600'>
            <Block display='flex' alignItems='baseline' justifyContent='space-between'>
                <HeadingSmall marginTop='0' marginBottom='scale900'>游戏管理</HeadingSmall>
                <LabelSmall><RouterLink href='/admin-panel/apps' kind='underline'>返回列表</RouterLink></LabelSmall>
            </Block>
            <Block display='flex' justifyContent='flex-start'>
                {isLoading
                    ? <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'>
                        <Spinner $size='scale1600' $borderWidth='scale300' $color='primary' />
                    </Block>
                    : (data && (
                        <Block display='flex' flexDirection='column' width='100%' gridGap='scale600'>
                            <Tabs activeKey={activeTab}
                                onChange={(e) => setActiveTab(e.activeKey)}
                                names={['快速操作', '论坛频道', '基本信息', '组织信息', '视觉信息', '分类信息', '联系信息', '系统需求', '支持语言', '专业评测', '获得荣誉']}
                            />
                            {activeTab === 0 && <AppDetailActions data={data} onChanged={() => fetchData()} />}
                            {activeTab === 1 && <AppDetailDiscussions data={data} />}
                            {activeTab === 2 && <AppDetailInfo data={data} onChanged={() => fetchData()} />}
                            {activeTab === 3 && <AppDetailOrganizations data={data} />}
                            {activeTab === 4 && <AppDetailMedia data={data} />}
                            {activeTab === 5 && <AppDetailTags data={data} />}
                            {activeTab === 6 && <AppDetailContact data={data} />}
                            {activeTab === 7 && <AppDetailRequirements data={data} />}
                            {activeTab === 8 && <AppDetailLanguages data={data} />}
                            {activeTab === 9 && <AppDetailProReviews data={data} />}
                            {activeTab === 10 && <AppDetailAwards data={data} />}
                        </Block>
                    ))
                }
            </Block>
        </Block>
    );
}

export default AdminPanelAppDetail;