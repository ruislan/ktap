import React from 'react';
import { useParams } from 'react-router-dom';

import { Block } from 'baseui/block';
import { HeadingSmall, LabelMedium, LabelSmall } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';

import Tabs from '@ktap/components/tabs';
import RouterLink from '@ktap/components/router-link';

import UserDetailProfile from './user-detail-profile';
import UserDetailActions from './user-detail-actions';
import UserDetailReviews from './user-detail-reviews';
import UserDetailReviewComments from './user-detail-review-comments';
import UserDetailTradings from './user-detail-tradings';


function AdminPanelUserDetail() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [data, setData] = React.useState(null);
    const fetchData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/users/${id}`);
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
                <HeadingSmall marginTop='0' marginBottom='scale900'>用户管理</HeadingSmall>
                <LabelSmall><RouterLink href='/admin-panel/users' kind='underline'>返回列表</RouterLink></LabelSmall>
            </Block>
            <Block display='flex' justifyContent='flex-start'>
                {isLoading
                    ? <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'>
                        <Spinner $size='scale1600' $borderWidth='scale300' $color='primary' />
                    </Block>
                    : (data &&
                        <Block display='flex' flexDirection='column' width='100%' gridGap='scale300'>
                            <Block display='flex' alignItems='center' marginBottom='scale600' gridGap='scale900' padding='scale600' backgroundColor='backgroundSecondary' overrides={{
                                Block: {
                                    style: ({ $theme }) => ({
                                        borderRadius: $theme.borders.radius300,
                                    })
                                }
                            }}>
                                <LabelMedium>用户名：{data.name}</LabelMedium>
                                <LabelMedium>邮箱：{data.email}</LabelMedium>
                            </Block>
                            <Block display='flex' alignItems='center' marginBottom='scale600'>
                                <Tabs activeKey={activeTab}
                                    onChange={(e) => setActiveTab(e.activeKey)}
                                    names={['快速操作', '个人信息', '评测列表', '评测回复', '交易记录']}
                                />
                            </Block>
                            {activeTab === 0 && <UserDetailActions data={data} onChanged={() => fetchData()} />}
                            {activeTab === 1 && <UserDetailProfile data={data} onChanged={() => fetchData()} />}
                            {activeTab === 2 && <UserDetailReviews data={data} />}
                            {activeTab === 3 && <UserDetailReviewComments data={data} />}
                            {activeTab === 4 && <UserDetailTradings data={data} />}
                        </Block>
                    )
                }
            </Block>
        </Block>
    );
}

export default AdminPanelUserDetail;