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
                    <Statistic title='新游戏' subtitle='近7天' text={Numbers.abbreviate(data?.apps || 0)} />
                    <Statistic title='新用户' subtitle='近7天' text={Numbers.abbreviate(data?.users || 0)} />
                    <Statistic title='新评测' subtitle='近7天' text={Numbers.abbreviate(data?.reviews || 0)} />
                    <Statistic title='新回复' subtitle='近7天' text={Numbers.abbreviate(data?.comments || 0)} />
                    <Statistic title='新礼物' subtitle='近7天' text={Numbers.abbreviate(data?.gifts || 0)} />
                    <Statistic title='新举报' subtitle='近7天' text={Numbers.abbreviate(data?.reports || 0)} />
                    <Statistic title='新流水' subtitle='近7天' text={Numbers.abbreviate(data?.amount || 0)} />
                </Block>
            }
        </Block>
    );
}

export default AdminPanelDashboard;