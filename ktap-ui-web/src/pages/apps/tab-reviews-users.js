import React from 'react';
import { Block } from 'baseui/block';
import { LabelLarge } from 'baseui/typography';

import TabReviewsUsersEditor from './tab-reviews-users-editor';
import TabReviewsUsersList from './tab-reviews-users-list';

function TabReviewsUsers({ app }) {
    return (
        <Block paddingTop={'scale600'} paddingBottom={'scale600'}>
            <Block paddingTop={'scale300'} paddingBottom={'scale300'} font='font300'>
                <LabelLarge>用户评测</LabelLarge>
            </Block>
            <Block>
                <TabReviewsUsersEditor app={app} />
                <TabReviewsUsersList app={app} />
            </Block>
        </Block>
    );
}
export default TabReviewsUsers;