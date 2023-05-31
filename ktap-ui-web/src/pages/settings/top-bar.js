import React from 'react';

import { Block } from 'baseui/block';
import { LabelSmall, LabelMedium } from 'baseui/typography';
import { useAuth } from '../../hooks/use-auth';
import AvatarSquare from '../../components/avatar-square';
import RouterLink from '../../components/router-link';
import GenderLabel from '../../components/gender-label';

function TopBar() {
    const { user } = useAuth();
    return (
        <>
            <Block display='flex' justifyContent='space-between' alignItems='center'>
                <Block display='flex' alignItems='center' justifyContent='flex-start'>
                    <Block display='flex' marginRight='scale300'>
                        <AvatarSquare size='scale1400' src={user?.avatar} />
                    </Block>
                    <Block display='flex' flexDirection='column'>
                        <Block display='flex' alignItems='center' marginBottom='scale100'>
                            <LabelMedium marginRight='scale100'>{user?.name}</LabelMedium>
                            <GenderLabel gender={user?.gender} />
                        </Block>
                        <LabelSmall color='primary300'>{user?.title}</LabelSmall>
                    </Block>
                </Block>
                <Block>
                    <LabelSmall><RouterLink href={`/users/${user.id}`} kind='underline'>返回个人页面</RouterLink></LabelSmall>
                </Block>
            </Block>
        </>
    );
}

export default TopBar;