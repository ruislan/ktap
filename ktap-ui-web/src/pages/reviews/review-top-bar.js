import React from 'react';

import { Block } from 'baseui/block';
import { LabelLarge, LabelMedium, LabelXSmall } from 'baseui/typography';

import { Star } from '../../components/icons';
import AvatarSquare from '../../components/avatar-square';
import useScoreRemark from '../../hooks/use-score-remark';
import RouterLink from '../../components/router-link';
import GenderLabel from '../../components/gender-label';
import { MOBILE_BREAKPOINT } from '../../constants';

const ReviewTopBar = React.memo(function ({ user, score }) {
    const { remark, color } = useScoreRemark({ score });
    return (
        <Block display='flex' justifyContent='flex-start' alignItems='center' padding='scale600'
            overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        background: $theme.colors.backgroundTertiary,
                        borderRadius: $theme.borders.radius300,
                        boxShadow: $theme.lighting.shadow700,
                        [MOBILE_BREAKPOINT]: { borderRadius: 0, }
                    })
                }
            }}
        >
            <AvatarSquare size='scale1400' src={user?.avatar} />
            <Block marginLeft='scale300' display='flex' alignItems='center' justifyContent='space-between' flex='1'>
                <Block display='flex' flexDirection='column'>
                    <Block display='flex' alignItems='center' marginBottom='scale100'>
                        <LabelLarge marginRight='scale100'><RouterLink href={`/users/${user.id}`}>{user.name}</RouterLink></LabelLarge>
                        <GenderLabel gender={user.gender} />
                    </Block>
                    <LabelXSmall color='primary100' marginRight='scale100'>{user?.title}</LabelXSmall>
                </Block>
                <Block display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                    <LabelXSmall color='inherit'>{remark}</LabelXSmall>
                    <Block display='flex' justifyContent='center' alignItems='center' color={color}>
                        <LabelMedium overrides={{
                            Block: {
                                style: ({ $theme }) => ({
                                    marginTop: '-2px',
                                    marginRight: $theme.sizing.scale0,
                                    fontSize: $theme.sizing.scale900,
                                    lineHeight: $theme.sizing.scale1000,
                                    color: 'inherit'
                                })
                            }
                        }}>
                            {score}
                        </LabelMedium>
                        <Star width={28} height={28} />
                    </Block>
                </Block>
            </Block>
        </Block>
    );
});

export default ReviewTopBar;