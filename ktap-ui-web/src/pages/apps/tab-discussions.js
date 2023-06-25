import React from 'react';

import { Block } from 'baseui/block';
import DiscussionsList from '../discussions/discussions-list';
function TabDiscussions({ app }) {
    const appId = app?.id || 0;

    return (
        <Block display='flex' flexDirection='column' gridGap='scale300' paddingTop='scale600' paddingBottom='scale600'>
            <DiscussionsList appId={appId} />
        </Block >
    );
}
export default TabDiscussions;