import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from "baseui/block";
import { LabelSmall, LabelXSmall } from "baseui/typography";
import { Skeleton } from 'baseui/skeleton';

function SystemIcon() {
    const [css, theme] = useStyletron();
    return (
        <div className={css({
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: theme.colors.primary, borderRadius: theme.borders.radius300,
            color: theme.colors.contentInversePrimary, width: theme.sizing.scale950, height: theme.sizing.scale950,
            minWidth: theme.sizing.scale950, minHeight: theme.sizing.scale950,
            fontSize: '20px', fontWeight: 600,
        })}>K</div>
    );
}

function NewIcon() {
    const [css, theme] = useStyletron();
    return (
        <div className={css({
            backgroundColor: theme.colors.primary, borderRadius: '50%',
            width: theme.sizing.scale300, height: theme.sizing.scale300,
        })} />
    );
}

function NotificationList({ activeIndex }) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [dataList, setDataList] = React.useState([]);

    React.useEffect(() => {
        (async function fetchData() {
            try {
                setIsLoading(true);
                setDataList([
                    { type: 'system', content: { text: '你的昵称通过了审核' }, read: false, },
                    { type: 'system', content: { text: '恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格恭喜你获得了内测资格' }, read: true, },
                ]);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [activeIndex]);

    if (isLoading) return (
        <Block padding='scale600'>
            <Skeleton width='100%' rows={3} height='144px' animation overrides={{ Row: { style: { height: '40px', borderRadius: '8px' } } }} />
        </Block>
    );
    return (
        <Block display='flex' flexDirection='column'>
            {dataList?.map((item, index) => (
                <Block key={index} display='flex' alignItems='center' gridGap='scale600'
                    paddingLeft='scale600' paddingRight='scale600' paddingTop='scale500' paddingBottom='scale500'
                    overrides={{
                        Block: {
                            style: ({ $theme }) => ({
                                borderBottomStyle: 'solid', borderBottomWidth: $theme.borders.border200.borderWidth,
                                borderBottomColor: $theme.borders.border200.borderColor,
                                ':last-child': { borderBottom: 'unset' },
                            })
                        }
                    }}>
                    {item.type === 'system' && <SystemIcon />}
                    <Block display='flex' flexDirection='column' gridGap='scale200' width='calc(100% - 44px)'>
                        <Block flex='1' display='flex' alignItems='center'>
                            <LabelSmall color='primary100' flex='1' overrides={{
                                Block: {
                                    style: {
                                        display: '-webkit-box',
                                        overflow: 'hidden',
                                        '-webkit-box-orient': 'vertical',
                                        '-webkit-line-clamp': 1,
                                    }
                                }
                            }}>系统</LabelSmall>
                            <LabelXSmall marginLeft='scale200' minWidth='fit-content' display='flex' color='primary300'>12分钟前</LabelXSmall>
                            {!item.read && <LabelXSmall marginLeft='scale200'><NewIcon /></LabelXSmall>}
                        </Block>
                        <LabelSmall color='primary100'
                            overrides={{
                                Block: {
                                    style: {
                                        fontWeight: 400,
                                        display: '-webkit-box',
                                        overflow: 'hidden',
                                        '-webkit-box-orient': 'vertical',
                                        '-webkit-line-clamp': 4,
                                    }
                                }
                            }}>{item.content.text}</LabelSmall>
                    </Block>
                </Block>
            ))}
        </Block>
    );
}


export default NotificationList;