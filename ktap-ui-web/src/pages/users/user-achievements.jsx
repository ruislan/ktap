import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Block } from 'baseui/block';
import { LabelSmall, LabelXSmall } from 'baseui/typography';

import SideBox from '@ktap/components/side-box';
import { useStyletron } from 'baseui';
import { StatefulPopover } from 'baseui/popover';

function Achievement({ achievement }) {
    const [css, theme] = useStyletron();
    return (
        <div className={css({ display: 'flex', flexDirection: 'column', width: '260px' })}>
            <div className={css({
                display: 'flex', alignItems: 'center', gap: theme.sizing.scale100,
                backgroundColor: theme.colors.backgroundTertiary, padding: theme.sizing.scale100,
                borderTopLeftRadius: theme.borders.radius300, borderTopRightRadius: theme.borders.radius300,
            })}>
                <div className={css({
                    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px',
                    padding: theme.sizing.scale100, backgroundColor: theme.colors.backgroundTertiary,
                    borderRadius: theme.borders.radius100,
                })}>
                    <img src={achievement.icon} width='100%' height='100%' />
                </div>
                <div className={css({ display: 'flex', flexDirection: 'column', flex: 1, gap: theme.sizing.scale100, })}>
                    <LabelSmall>{achievement.name}</LabelSmall>
                    <LabelXSmall>{achievement.description}</LabelXSmall>
                </div>
            </div>

            <div className={css({
                display: 'flex', flexDirection: 'column', padding: theme.sizing.scale300,
                backgroundColor: 'rgb(41,41,41)',
                borderBottomLeftRadius: theme.borders.radius300, borderBottomRightRadius: theme.borders.radius300,
            })}>
                <LabelXSmall>进度：{achievement.progress}</LabelXSmall>
            </div>
        </div>
    );
}

function Award({ achievement }) {
    const [css, theme] = useStyletron();
    return (
        <StatefulPopover placement='top' triggerType='click' content={() => <Achievement achievement={achievement} />}>
            <div className={css({
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px',
                padding: theme.sizing.scale100, cursor: 'pointer',
                backgroundColor: theme.colors.backgroundTertiary,
                borderRadius: theme.borders.radius100,
            })}>
                <img src={achievement.icon} width='100%' height='100%' />
            </div>
        </StatefulPopover>
    );
}

// 用户成就
function UserAchievements({ theUser }) {
    const { id } = useParams();
    const [dataList, setDataList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (theUser && theUser.id === Number(id)) {
            setIsLoading(true);
            setDataList([
                { icon: '/public/img/achievements/a2.png', name: '初出茅庐', description: '首次登陆', progress: '0/1000', },
                { icon: '/public/img/achievements/a3.png', name: '初出茅庐', description: '首次登陆', progress: '0/1', },
                { icon: '/public/img/achievements/a4.png', name: '初出茅庐', description: '首次登陆', progress: '0/1', },
                { icon: '/public/img/achievements/a5.png', name: '初出茅庐', description: '首次登陆', progress: '0/1', },
                { icon: '/public/img/achievements/a6.png', name: '初出茅庐', description: '首次登陆', progress: '0/1', },
                { icon: '/public/img/achievements/a7.png', name: '初出茅庐', description: '首次登陆', progress: '0/1', },
            ]);
            console.log('load from server');
            setIsLoading(false);
        }
    }, [theUser, id]);

    if (isLoading) return null;

    return (
        <SideBox title='成就'>
            <Block backgroundColor='backgroundSecondary' paddingLeft='scale600' paddingRight='scale600' paddingBottom='scale600' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        borderRadius: $theme.borders.radius300,
                    })
                }
            }}>
                <Block display='grid' gridTemplateColumns='repeat(5, 1fr)' gridGap='scale300'>
                    {dataList.map((achievement, index) => <Award key={index} achievement={achievement} />)}
                </Block>
            </Block>
        </SideBox>
    );
}

export default UserAchievements;