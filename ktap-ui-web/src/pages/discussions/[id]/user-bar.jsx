import { Block } from 'baseui/block';
import { LabelMedium, LabelXSmall } from 'baseui/typography';

import AvatarSquare from '@ktap/components/avatar-square';
import GenderLabel from '@ktap/components/gender-label';
import RouterLink from '@ktap/components/router-link';

export default function UserBar({ id, name, avatar, gender, title }) {
    return (
        <Block display='flex' alignItems='center' gridGap='scale300'>
            <AvatarSquare size='scale1000' src={avatar} />
            <Block display='flex' alignItems='center' justifyContent='space-between' flex='1'>
                <Block display='flex' flexDirection='column'>
                    <Block display='flex' alignItems='center' marginBottom='scale100'>
                        <LabelMedium marginRight='scale100'><RouterLink href={`/users/${id}`}>{name}</RouterLink></LabelMedium>
                        <GenderLabel gender={gender} />
                    </Block>
                    <LabelXSmall color='primary100' marginRight='scale100'>{title}</LabelXSmall>
                </Block>
            </Block>
        </Block>
    );
}