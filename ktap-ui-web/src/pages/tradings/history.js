import React from 'react';
import dayjs from 'dayjs';
import { Block } from "baseui/block";
import { HeadingSmall, LabelSmall } from 'baseui/typography';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { Button } from 'baseui/button';
import { Skeleton } from 'baseui/skeleton';
import { LAYOUT_MAIN, MOBILE_BREAKPOINT, PAGE_LIMIT_NORMAL, Trading } from '../../constants';

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
                    {row => <LabelSmall whiteSpace='nowrap'>{dayjs(row.createdAt).format('YYYY 年 MM 月 DD 日 HH:mm:ss')}</LabelSmall>}
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
            {isLoading && <Block display='flex' flexDirection='column' marginTop='scale300' marginBottom='scale300' gridGap='scale300' justifyContent='center'>
                <Skeleton animation height='40px' width='100%' />
                <Skeleton animation height='40px' width='100%' />
                <Skeleton animation height='40px' width='100%' />
            </Block>}
            {hasMore && !isLoading &&
                <Block marginTop='scale600' display='flex' justifyContent='center' alignItems='center'>
                    <Button size='default' kind='tertiary' onClick={() => setSkip(prev => prev + limit)}>
                        查看更多
                    </Button>
                </Block>
            }
        </Block>
    );
}

export default TradingHistory;