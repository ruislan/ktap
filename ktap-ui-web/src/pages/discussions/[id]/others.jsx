import React from 'react';
import { Link } from 'react-router-dom';

import { useStyletron } from 'baseui';

import { Block } from 'baseui/block';
import { Skeleton } from 'baseui/skeleton';
import { LabelSmall } from 'baseui/typography';

import { Message4 } from '@ktap/components/icons';
import SideBox from '@ktap/components/side-box';

export default function Others({ discussionId }) {
    const [css, theme] = useStyletron();
    const [discussions, setDiscussions] = React.useState([]);
    const [isLoading, setLoading] = React.useState(true);
    React.useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/discussions/${discussionId}/others?limit=10`);
                if (res.ok) {
                    const json = await res.json();
                    setDiscussions(json.data);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [discussionId]);
    return (
        <SideBox title='其他主题'>
            <Block display='flex' flexDirection='column' gridGap='scale100' paddingLeft='scale300' paddingRight='scale300' paddingBottom='scale600'>
                {isLoading ?
                    [...Array(3)].map((_, index) => (<Skeleton key={index} width='100%' height='32px' animation />)) :
                    discussions.map((discussion, index) => (
                        <Link key={index} to={`/discussions/${discussion.id}`} className={css({
                            textDecoration: 'none', display: 'flex', gap: theme.sizing.scale300, alignItems: 'center', justifyContent: 'space-between',
                            padding: theme.sizing.scale300, borderRadius: theme.borders.radius200, color: 'inherit',
                            backgroundColor: 'rgba(109, 109, 109, 0.1)',
                            cursor: 'pointer',
                            ':hover': {
                                backgroundColor: 'rgba(109, 109, 109, 0.3)',
                            },
                        })}>
                            <LabelSmall color='primary100' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>{discussion.title}</LabelSmall>
                            <Block display='flex' alignItems='center' gridGap='scale100'>
                                <Message4 width='16px' height='16px' />
                                <LabelSmall color='inherit'>{discussion.meta.posts}</LabelSmall>
                            </Block>
                        </Link>
                    ))
                }
            </Block>
        </SideBox>
    );
}

