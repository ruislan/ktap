import React from 'react';
import { useParams } from 'react-router-dom';
import { Block } from 'baseui/block';
import { useAuth } from '../../hooks/use-auth';
import { LabelXSmall } from 'baseui/typography';
import SideBox from '../../components/side-box';

function Achievement({ src, name, progress }) {
    return (
        <Block padding='scale100' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    borderRadius: $theme.borders.radius200,
                    backgroundColor: $theme.colors.backgroundTertiary,
                    border: 'solid 1px',
                })
            }
        }}>
            <Block padding='scale100'>
                <img src={src} width='48px' height='48px' />
            </Block>
            <Block display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                <LabelXSmall>{name}</LabelXSmall>
                <LabelXSmall>{progress}</LabelXSmall>
            </Block>
        </Block>
    );
}

// 用户成就
// V2或V3再实现，现在先放着
function UserAchievements() {
    let { user } = useAuth();
    const { id } = useParams();

    React.useEffect(() => {
        if (user && user.id === Number(id)) {
            console.log('load from server');
        }
    }, [user, id]);

    return (
        <SideBox title='成就'>
            <Block backgroundColor='backgroundSecondary' padding='scale600' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        borderRadius: $theme.borders.radius300,
                    })
                }
            }}>
                <Block display='flex' flexWrap='wrap' gridGap='scale300' alignItems='baseline'>
                    <Achievement name='初出茅庐' progress='达成' src='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='达成' src='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='达成' src='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='达成' src='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='达成' src='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='达成' src='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='达成' src='/public/img/achievements/a1.png' />
                    <Achievement name='初出茅庐' progress='达成' src='/public/img/achievements/a1.png' />
                </Block>
            </Block>
        </SideBox>
    );
}

export default UserAchievements;