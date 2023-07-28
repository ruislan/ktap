import React from 'react';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Skeleton } from 'baseui/skeleton';

const puns = ['查看更多', '我还要', '再看看', '再来', 'More, More', '再查，再探', '接着奏乐，接着舞'];

function SkeletonLayout({ direction, children }) {
    return (
        <>
            {direction === 'column' && <Block display='flex' flexDirection='column' gridGap='scale600' justifyContent='center'>{children}</Block>}
            {direction === 'row' && <Block display='grid' gridTemplateColumns='repeat(auto-fill,minmax(240px,1fr))' gridGap='scale600'>{children}</Block>}
        </>
    )
}

export default function LoadMore({ isLoading, hasMore, skeletonRow = 3, skeletonHeight = '100%', pun = false, skeletonDirection = 'column', onClick = () => { } }) {
    return (
        <Block marginTop='scale600' marginBottom='scale600'>
            {isLoading &&
                <SkeletonLayout direction={skeletonDirection}>
                    {[...Array(skeletonRow)].map((_, index) => <Skeleton animation height={skeletonHeight} width='100%' key={index} />)}
                </SkeletonLayout>}
            {hasMore && !isLoading &&
                <Block display='flex' justifyContent='center' alignItems='center'>
                    <Button onClick={onClick} kind='tertiary'>
                        {pun ? puns[Math.floor(Math.random() * puns.length) | 0] : puns[0]}
                    </Button>
                </Block>
            }
        </Block>
    );
}