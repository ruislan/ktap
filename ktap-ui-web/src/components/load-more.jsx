import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Skeleton } from 'baseui/skeleton';

const puns = ['查看更多', '我还要', '再看看', '再来', 'More, More', '再查，再探', '接着奏乐，接着舞'];

function SkeletonLayout({ direction, children }) {
    if (direction === 'column') return <Block display='flex' flexDirection='column' gridGap='scale600' justifyContent='center'>{children}</Block>;
    if (direction === 'row') return <Block display='grid' gridTemplateColumns='repeat(auto-fill,minmax(240px,1fr))' gridGap='scale600'>{children}</Block>;
    return null;
}

export default function LoadMore({ size = 'default', isLoading, hasMore, skeletonRow = 3, skeletonHeight = '100%', pun = false, skeletonDirection = 'column', onClick = () => { } }) {

    const margin = size === 'default' ? 'scale600' : 'scale300';

    if (isLoading) return (
        <Block marginTop={margin} marginBottom={margin}>
            <SkeletonLayout direction={skeletonDirection}>
                {[...Array(skeletonRow)].map((_, index) => <Skeleton animation height={skeletonHeight} width='100%' key={index} />)}
            </SkeletonLayout>
        </Block>
    );

    if (!hasMore) return null;

    return (
        <Block marginTop={margin} marginBottom={margin}>
            <Block display='flex' justifyContent='center' alignItems='center'>
                <Button onClick={onClick} kind='tertiary' size={size}>
                    {pun ? puns[Math.floor(Math.random() * puns.length) | 0] : puns[0]}
                </Button>
            </Block>
        </Block>
    );
}