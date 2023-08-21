import { Block } from 'baseui/block';
import { LabelSmall, LabelMedium } from 'baseui/typography';

import { useAuth } from '@ktap/hooks/use-auth';
import AvatarSquare from '@ktap/components/avatar-square';
import RouterLink from '@ktap/components/router-link';
import GenderLabel from '@ktap/components/gender-label';

function TopBar() {
    const { user } = useAuth();
    return (
        <Block paddingLeft='scale600' paddingRight='scale600' marginBottom='scale900'>
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
        </Block>
    );
}

export default TopBar;