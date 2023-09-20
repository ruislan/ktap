import React from 'react';
import { useParams } from 'react-router-dom';

import { Block } from 'baseui/block';
import { LabelSmall, LabelXSmall } from 'baseui/typography';

import SideBox from '@ktap/components/side-box';
import { useStyletron } from 'baseui';

function Achievement({ icon, name, description, progress }) {
    const [css, theme] = useStyletron();
    return (
        <div className={css({
            display: 'flex', alignItems: 'center', gap: theme.sizing.scale300,
        })}>
            <div className={css({
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px',
                padding: theme.sizing.scale100,
                backgroundColor: theme.colors.backgroundTertiary,
                borderRadius: theme.borders.radius100,
            })}><img src={icon} width='100%' height='100%' /></div>
            {/* <div className={css({
                display: 'flex', flexDirection: 'column', flex: 1,
            })}>
                <LabelSmall>{name}</LabelSmall>
                <LabelXSmall>{description}</LabelXSmall>
                <LabelXSmall>{progress}</LabelXSmall>
            </div> */}
        </div>
    );
}

// 用户成就
function UserAchievements({ theUser }) {
    const { id } = useParams();

    React.useEffect(() => {
        if (theUser && theUser.id === Number(id)) {
            console.log('load from server');
        }
    }, [theUser, id]);

    return (
        <SideBox title='成就'>
            <Block backgroundColor='backgroundSecondary' paddingLeft='scale600' paddingRight='scale600' paddingBottom='scale600' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        borderRadius: $theme.borders.radius300,
                    })
                }
            }}>
                <Block display='flex' flexWrap gridGap='scale300'>
                    <Achievement name='初出茅庐' progress='达成' description='首次登陆' icon='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='0/1000' description='首次登陆' icon='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='达成' description='首次登陆' icon='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='达成' description='首次登陆' icon='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='达成' description='首次登陆' icon='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='达成' description='首次登陆' icon='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='达成' description='首次登陆' icon='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='达成' description='首次登陆' icon='/public/img/achievements/a1.png' />
                </Block>
            </Block>
        </SideBox>
    );
}

export default UserAchievements;