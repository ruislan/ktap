import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { StatefulPopover } from 'baseui/popover';
import { Block } from 'baseui/block';

import SideBox from '@ktap/components/side-box';
import Achievement from '@ktap/components/achievement';

function Award({ achievement }) {
    const [css, theme] = useStyletron();
    return (
        <StatefulPopover placement='topRight' triggerType='hover' content={() => <Achievement achievement={achievement} />}>
            <div className={css({
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px',
                padding: theme.sizing.scale100, cursor: 'pointer',
                backgroundColor: theme.colors.backgroundTertiary,
                borderRadius: theme.borders.radius100, filter: `grayscale(${1 - achievement.accumulation / achievement.criteria})`,
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
        if (!theUser) return;
        (async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/users/${theUser.id}/achievements/recent`);
                if (res.ok) {
                    const json = await res.json();
                    setDataList(json.data);
                }
            } finally {
                setIsLoading(false);
            }
        })();
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