import React from 'react';
import { Block } from 'baseui/block';
import { LabelMedium } from 'baseui/typography';
import { MOBILE_BREAKPOINT } from '../../constants';
import useScoreRemark from '../../hooks/use-score-remark';
import { Question } from '../../components/icons';
import { StatefulTooltip } from "baseui/tooltip";

function MetaItem({ label, value, tips, title, }) {
    return (
        <Block padding='scale600'>
            <LabelMedium display='flex' gridGap='scale0' alignItems='center' marginBottom='scale100' color='primary400' overrides={{
                Block: {
                    style: {
                        fontSize: '15px',
                        fontFamily: '"Motiva Sans", Sans-serif;',
                        textShadow: '1px 1px rgb(0 0 0 / 20%)',
                        fontWeight: '600',
                    }
                }
            }}>
                {label}
                {title &&
                    <StatefulTooltip content={title} autoFocus returnFocus accessibilityType='tooltip' placement='top'>
                        <Block display='flex' justifyContent='center' alignItems='center'>
                            <Question width='16' height='16' />
                        </Block>
                    </StatefulTooltip>}
            </LabelMedium>
            <Block display='flex' alignItems='baseline'>
                <LabelMedium color='primary100' overrides={{
                    Block: {
                        style: {
                            fontFamily: '"Motiva Sans", Sans-serif;',
                            textShadow: '1px 1px rgb(0 0 0 / 20%)',
                            fontWeight: '700',
                            fontSize: '17px',
                        }
                    }
                }}>
                    {value}
                </LabelMedium>
                {
                    tips ? <LabelMedium marginLeft='4px' font='font100' color='primary400'>({tips})</LabelMedium> : null
                }
            </Block>
        </Block>
    );
}


function MetaBar({ meta }) {
    const [percent, setPercent] = React.useState(null);
    const [score, setScore] = React.useState(0);
    const { remark } = useScoreRemark({ score });
    React.useEffect(() => {
        const total = meta.ratings?.reduce((acc, cur) => acc + cur.count, 0);
        const top = meta.ratings?.sort((a, b) => b.count - a.count)[0];
        setScore(top.count === 0 ? 0 : top.score);
        setPercent(total === 0 ? 0 : (top.count * 100 / total).toFixed(2));
    }, [meta]);
    return (
        <Block overrides={{
            Block: {
                style: ({ $theme }) => ({
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: $theme.sizing.scale900,
                    marginBottom: $theme.sizing.scale900,
                    width: 'auto',
                    backgroundColor: $theme.colors.backgroundSecondary,
                    borderRadius: $theme.borders.radius300,
                    [MOBILE_BREAKPOINT]: {
                        flexDirection: 'column',
                        marginLeft: $theme.sizing.scale600,
                        marginRight: $theme.sizing.scale600,
                    }
                })
            }
        }}>
            <Block overrides={{
                Block: {
                    style: () => ({
                        display: 'flex',
                        alignItems: 'center',
                        [MOBILE_BREAKPOINT]: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            width: '100%',
                        }
                    })
                }
            }}>
                <MetaItem label='热力指数' value={meta.popular || 0} title='（最近一周的）关注*2+评测*10+评测回复*1+讨论*5+讨论回复*1' />
                <MetaItem label='关注数量' value={meta.follows || 0} />
                <MetaItem label='评测数量' value={meta.reviews || 0} />
                <MetaItem label='多数评价' value={remark} tips={percent == 0 ? null : percent + '%'} />
            </Block>
        </Block>
    );
}

export default MetaBar;