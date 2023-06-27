import React from 'react';

import { Block } from 'baseui/block';
import DiscussionList from '../discussions/discussion-list';

// TODO 这里可以做成最新的讨论列表，不需要集成那边的，如果要参与讨论，主战场在那边。
function TabDiscussions({ app }) {
    const appId = app?.id || 0;

    return (
        <Block display='flex' flexDirection='column' gridGap='scale300' paddingTop='scale600' paddingBottom='scale600'>
            <DiscussionList appId={appId} />
        </Block >
    );
}
export default TabDiscussions;