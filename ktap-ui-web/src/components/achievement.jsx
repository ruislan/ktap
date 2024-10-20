import { useStyletron } from 'baseui';

import { LabelSmall, LabelXSmall } from 'baseui/typography';

import { DateTime } from '@ktap/libs/utils';

export default function Achievement({ achievement }) {
    const [css, theme] = useStyletron();
    return (
        <div className={css({ display: 'flex', flexDirection: 'column', width: '100%', boxShadow: theme.lighting.shadow700 })}>
            <div className={css({
                display: 'flex', alignItems: 'center', gap: theme.sizing.scale100,
                backgroundColor: theme.colors.backgroundTertiary, padding: theme.sizing.scale100,
                borderTopLeftRadius: theme.borders.radius300, borderTopRightRadius: theme.borders.radius300,
            })}>
                <div className={css({
                    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px',
                    padding: theme.sizing.scale100, backgroundColor: theme.colors.backgroundTertiary,
                    borderRadius: theme.borders.radius100, filter: `grayscale(${1 - achievement.accumulation / achievement.criteria})`,
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
                {achievement.unlockedAt ?
                    <LabelXSmall>达成时间：{DateTime.formatCN(achievement.unlockedAt)}</LabelXSmall> :
                    <LabelXSmall>当前进度：{achievement.accumulation} / {achievement.criteria}</LabelXSmall>}
            </div>
        </div>
    );
};






