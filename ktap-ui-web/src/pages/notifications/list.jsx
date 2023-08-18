import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from "baseui/block";
import { LabelSmall } from "baseui/typography";
import { Skeleton } from 'baseui/skeleton';

function SystemIcon() {
    const [css, theme] = useStyletron();
    return (
        <div className={css({
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: theme.colors.primary, borderRadius: theme.borders.radius300,
            color: theme.colors.contentInversePrimary, width: theme.sizing.scale950, height: theme.sizing.scale950,
            fontSize: '20px', fontWeight: 600,
        })}>K</div>
    );
}

function NotificationList() {
    const dataList = [
        { type: 'system', content: { text: '你的昵称通过了审核' } },
        { type: 'system', content: { text: '恭喜你获得了内测资格' } },
    ];

    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
        (async function fetchData() {
            try {
                setIsLoading(true);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    if (isLoading) return (
        <Block padding='scale600'>
            <Skeleton width='100%' rows={3} height='144px' animation overrides={{ Row: { style: { height: '40px', borderRadius: '8px' } } }} />
        </Block>
    );
    return (
        <Block display='flex' flexDirection='column'>
            {dataList?.map((item, index) => (
                <Block key={index} display='flex' alignItems='center' gridGap='scale300'
                    paddingLeft='scale600' paddingRight='scale600' paddingTop='scale500' paddingBottom='scale500'
                    overrides={{
                        Block: {
                            style: {
                                borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                                ':last-child': { borderBottom: 'unset' },
                            }
                        }
                    }}>
                    {item.type === 'system' && <SystemIcon />}
                    <Block display='flex' flexDirection='column' gridGap='scale100'>
                        <LabelSmall><b>系统</b></LabelSmall>
                        <LabelSmall overrides={{ Block: { style: { fontWeight: 400, } } }}>{item.content.text}</LabelSmall>
                    </Block>
                </Block>
            ))}
        </Block>
    );
}


export default NotificationList;