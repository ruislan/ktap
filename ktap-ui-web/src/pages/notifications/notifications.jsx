import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelSmall, LabelXSmall } from 'baseui/typography';

import { PAGE_LIMIT_MINI } from '@ktap/libs/utils';
import LoadMore from '@ktap/components/load-more';
import AvatarSquare from '@ktap/components/avatar-square';

import { MENU_ITEMS, TYPES } from './constants';
import { TabBar, TitleBar } from './bar';

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

function ActorAvatar({ type, actor }) {
    switch (type) {
        case TYPES.SYSTEM: return <SystemIcon />;
        case TYPES.FOLLOWING:
        case TYPES.REACTION:
            return <AvatarSquare size='scale950' src={actor?.avatar} />;
    }
    return null;
}

function ItemContainer({ to, ...rest }) {
    const [css, theme] = useStyletron();
    const style = css({
        display: 'flex', alignItems: 'center', gap: theme.sizing.scale600,
        paddingLeft: theme.sizing.scale600, paddingRight: theme.sizing.scale600,
        paddingTop: theme.sizing.scale500, paddingBottom: theme.sizing.scale500,
        borderBottomStyle: 'solid', borderBottomWidth: theme.borders.border200.borderWidth,
        borderBottomColor: theme.borders.border200.borderColor, textDecoration: 'none',
        ':last-child': { borderBottomWidth: 'unset', borderBottomColor: 'unset', borderBottomStyle: 'unset' },
    });
    if (!to) return <div className={style} {...rest} />;
    return <a href={to} className={style} {...rest} />;
}

function NotificationItem({ item }) {
    return (
        <ItemContainer to={item.url}>
            <ActorAvatar type={item.type} actor={item.actor} />
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
                    }}>{item.title}</LabelSmall>
                    <LabelXSmall marginLeft='scale200' minWidth='fit-content' display='flex' color='primary300'>12分钟前</LabelXSmall>
                    {!item.isRead && <LabelXSmall marginLeft='scale200'><NewIcon /></LabelXSmall>}
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
                    }}>{item.content}</LabelSmall>
            </Block>
        </ItemContainer>
    );
}

function Notifications({ size = 'default', activeIndex, onActiveIndexChanged, dataLimit = PAGE_LIMIT_MINI }) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [dataList, setDataList] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const activeType = MENU_ITEMS[activeIndex].type;

    const fetchData = React.useCallback(async (activeType, skip, dataLimit) => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/user/notifications?type=${activeType}&skip=${skip}&limit=${dataLimit}`, { headers: { 'Content-Type': 'application/json', }, });
            if (res.ok) {
                const json = await res.json();
                setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                setHasMore(json.skip + json.limit < json.count);
                setSkip(skip + dataLimit);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        setDataList([]);
        fetchData(activeType, 0, dataLimit);
    }, [fetchData, activeType, dataLimit]);

    const afterClear = async () => {
        if (isLoading) return;
        setDataList([]);
    };

    const afterRead = async () => {
        if (isLoading) return;
        setDataList(prev => prev.map(item => ({ ...item, isRead: true })));
    };

    return (
        <Block display='flex' flexDirection='column'>
            {size === 'compact' ?
                <TabBar activeIndex={activeIndex} onTabChange={onActiveIndexChanged} onClear={afterClear} onRead={afterRead} /> :
                <TitleBar activeIndex={activeIndex} onClear={afterClear} onRead={afterRead} />}
            <Block display='flex' flexDirection='column' overflow='scrollY' maxHeight='300px'>
                {dataList && dataList.map((item, index) => <NotificationItem key={index} item={item} />)}
                {!isLoading && dataList && dataList.length === 0 && <LabelSmall display='flex' alignItems='center' justifyContent='center' height='62px'>您当前没有任何通知</LabelSmall>}
                <LoadMore size={size} isLoading={isLoading} hasMore={hasMore} skeletonRow={1} skeletonHeight='62px' onClick={() => {
                    fetchData(activeType, skip, dataLimit);
                }} />
            </Block>
        </Block>
    );
}

export default Notifications;