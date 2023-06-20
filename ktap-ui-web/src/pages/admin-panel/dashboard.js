import React from 'react';

import { Block } from 'baseui/block';
import { HeadingSmall } from 'baseui/typography';
import Statistic from '../../components/statistic';
import { Numbers } from '../../constants';

function AdminPanelDashboard() {
    const [data, setData] = React.useState();
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/admin/stats?days=7');
                if (res.ok) {
                    const json = await res.json();
                    setData(json.data);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);
    return (
        <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600'>
            <HeadingSmall marginTop='0' marginBottom='scale900'>数据概览</HeadingSmall>
            {!isLoading &&
                <Block display='flex' flexWrap='wrap' justifyContent='stretch' alignItems='center'>
                    <Statistic title='发布游戏' subtitle='近7天' text={Numbers.abbreviate(data?.apps || 0)} />
                    <Statistic title='注册用户' subtitle='近7天' text={Numbers.abbreviate(data?.users || 0)} />
                    <Statistic title='游戏评测' subtitle='近7天' text={Numbers.abbreviate(data?.reviews || 0)} />
                    <Statistic title='评测回复' subtitle='近7天' text={Numbers.abbreviate(data?.reviewComments || 0)} />
                    <Statistic title='评测举报' subtitle='近7天' text={Numbers.abbreviate(data?.reports || 0)} />
                    <Statistic title='交易流水' subtitle='近7天' text={Numbers.abbreviate(data?.amount || 0)} />
                </Block>
            }
        </Block>
    );
}

export default AdminPanelDashboard;