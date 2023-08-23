import React from 'react';

import { Block } from 'baseui/block';
import { LabelSmall, LabelXSmall } from 'baseui/typography';

import RouterLink from '@ktap/components/router-link';

import NotificationList from './list';
import { TabBar } from './bar';

const TitleBar = React.memo(function TitleBar() {
    return (
        <Block display='flex' alignItems='center' justifyContent='space-between'
            paddingLeft='scale600' paddingRight='scale600' paddingTop='scale600' paddingBottom='scale300'>
            <LabelSmall>通知中心</LabelSmall>
            <RouterLink href='/settings/notifications'><LabelXSmall color='primary300'>设置</LabelXSmall></RouterLink>
        </Block>
    );
});

export default function CompactView() {
    const [activeTab, setActiveTab] = React.useState(0);

    return (
        <Block display='flex' flexDirection='column'>
            <TitleBar />
            <TabBar activeIndex={activeTab} onTabChange={to => setActiveTab(to)} unread={4} />
            <NotificationList activeIndex={activeTab} />
        </Block >
    );
}