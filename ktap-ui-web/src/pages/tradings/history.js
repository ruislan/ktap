import React from 'react';
import { Block } from "baseui/block";
import { HeadingSmall, LabelSmall } from 'baseui/typography';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { DateTime, LAYOUT_MAIN, MOBILE_BREAKPOINT, PAGE_LIMIT_NORMAL, Trading } from '../../constants';
import LoadMore from '../../components/load-more';

function TradingHistory() {
    const limit = PAGE_LIMIT_NORMAL;
    const [isLoading, setIsLoading] = React.useState(false);
    const [data, setData] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/user/tradings/history?limit=${limit}&skip=${skip}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                    setHasMore(json.skip + json.limit < json.count);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [skip, limit]);

    return (
        <Block display='flex' flexDirection='column' width={LAYOUT_MAIN} maxWidth='100%' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    [MOBILE_BREAKPOINT]: {
                        paddingLeft: $theme.sizing.scale600, paddingRight: $theme.sizing.scale600,
                    }
                })
            }
        }}>
            <HeadingSmall>交易历史</HeadingSmall>
            <TableBuilder data={data} size='default' emptyMessage='没有数据'
                overrides={{
                    Root: {
                        style: {
                            borderRadius: '8px'
                        }
                    },
                    TableBodyCell: {
                        style: {
                            verticalAlign: 'middle', whiteSpace: 'nowrap'
                        }
                    }
                }}
            >
                <TableBuilderColumn header='时间'>
                    {row => <LabelSmall whiteSpace='nowrap'>{DateTime.formatCN(row.createdAt)}</LabelSmall>}
                </TableBuilderColumn>
                <TableBuilderColumn header='内容'>
                    {row => <LabelSmall>{Trading.target.getContentLabel(row.target)}</LabelSmall>}
                </TableBuilderColumn>
                <TableBuilderColumn header='类型'>
                    {row => <LabelSmall>{Trading.type.getDisplayLabel(row.type)}</LabelSmall>}
                </TableBuilderColumn>
                <TableBuilderColumn header='总计'>
                    {row => <LabelSmall>{Trading.type.getDirectionLabel(row.type)} {row.amount}</LabelSmall>}
                </TableBuilderColumn>
            </TableBuilder>
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='40px' onClick={() => setSkip(prev => prev + limit)} />
        </Block>
    );
}

export default TradingHistory;