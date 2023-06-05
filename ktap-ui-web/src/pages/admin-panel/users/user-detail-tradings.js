import React from 'react';
import dayjs from 'dayjs';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Spinner } from 'baseui/spinner';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { LabelSmall } from 'baseui/typography';
import { ArrowLeft, ArrowRight } from 'baseui/icon';
import { Trading } from '../../../constants';

function UserDetailTradings({ data }) {
    const limit = 10;
    const [isLoading, setIsLoading] = React.useState(true);
    const [comments, setComments] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasNext, setHasNext] = React.useState(false);
    const [hasPrev, setHasPrev] = React.useState(false);

    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/admin/users/${data.id}/tradings?skip=${skip}&limit=${limit}`);
                if (res.ok) {
                    const json = await res.json();
                    setComments(json.data);
                    setHasNext(json.skip + json.limit < json.count);
                    setHasPrev(json.skip + json.limit > json.limit);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [data, skip]);

    return (
        <Block display='flex' flexDirection='column'>
            {isLoading
                ? <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'><Spinner $size='scale1400' $borderWidth='scale200' /></Block>
                :
                <Block display='flex' flexDirection='column'>
                    <Block marginBottom='scale600' display='flex' alignItems='center' justifyContent='flex-end'>
                        <Block display='flex' gridGap='scale300'>
                            <Button size='mini' kind='secondary' shape='circle' isLoading={isLoading} disabled={!hasPrev}
                                onClick={() => setSkip(prev => prev - limit)}>
                                <ArrowLeft width={16} title='上一页' />
                            </Button>
                            <Button size='mini' kind='secondary' shape='circle' isLoading={isLoading} disabled={!hasNext}
                                onClick={() => setSkip(prev => prev + limit)}>
                                <ArrowRight width={16} title='下一页' />
                            </Button>
                        </Block>
                    </Block>
                    <TableBuilder data={comments} size='compact' emptyMessage='没有数据'
                        overrides={{
                            TableBodyCell: {
                                style: {
                                    verticalAlign: 'middle',
                                }
                            }
                        }}
                    >
                        <TableBuilderColumn header='ID'>
                            {row => <LabelSmall >{row.id}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='对象'>
                            {row => <LabelSmall>{row.target}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='对象ID'>
                            {row => <LabelSmall>{row.targetId}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='类型'>
                            {row => <LabelSmall>{Trading.type.getDisplayLabel(row.type)}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='金额'>
                            {row => <LabelSmall>{Trading.type.getDirectionLabel(row.type)} {row.amount}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='创建于'>
                            {row => <LabelSmall>{dayjs(row?.createdAt).format('YYYY-MM-DD HH:mm:ss')}</LabelSmall>}
                        </TableBuilderColumn>
                    </TableBuilder>
                </Block>
            }
        </Block>
    );
}

export default UserDetailTradings;