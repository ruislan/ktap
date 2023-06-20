import React from 'react';
import { useParams } from 'react-router-dom';

import { Block } from 'baseui/block';
import { HeadingSmall, LabelMedium, LabelSmall } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import { StatelessAccordion, Panel } from 'baseui/accordion';
import RouterLink from '../../../components/router-link';
import UserDetailProfile from './user-detail-profile';
import UserDetailActions from './user-detail-actions';
import UserDetailReviews from './user-detail-reviews';
import UserDetailReviewComments from './user-detail-review-comments';
import UserDetailTradings from './user-detail-tradings';
import { Styles } from '../../../constants';

function AdminPanelUserDetail() {
    const { id } = useParams();
    const [expanded, setExpanded] = React.useState(['p1']);
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
                    ? <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'><Spinner $size='scale1600' $borderWidth='scale200' /></Block>
                    : (data &&
                        <Block display='flex' flexDirection='column' width='100%'>
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
                            <StatelessAccordion accordion={false} expanded={expanded} onChange={({ expanded }) => setExpanded(expanded)}>
                                <Panel key='p1' title='快速操作' overrides={Styles.Accordion.Panel}><UserDetailActions data={data} onChanged={() => fetchData()} /></Panel>
                                <Panel key='p2' title='个人信息' overrides={Styles.Accordion.Panel}><UserDetailProfile data={data} onChanged={() => fetchData()} /></Panel>
                                <Panel key='p3' title='评测列表' overrides={Styles.Accordion.Panel}><UserDetailReviews data={data} /></Panel>
                                <Panel key='p4' title='评测回复列表' overrides={Styles.Accordion.Panel}><UserDetailReviewComments data={data} /></Panel>
                                <Panel key='p5' title='交易记录' overrides={Styles.Accordion.Panel}><UserDetailTradings data={data} /></Panel>
                            </StatelessAccordion>
                        </Block>
                    )
                }
            </Block>
        </Block>
    );
}

export default AdminPanelUserDetail;