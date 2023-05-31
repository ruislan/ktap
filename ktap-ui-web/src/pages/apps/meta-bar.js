import React from 'react';
import { Block } from 'baseui/block';
import { LabelMedium } from 'baseui/typography';
import { MOBILE_BREAKPOINT } from '../../constants';
import useScoreRemark from '../../hooks/use-score-remark';

function MetaItem({ label, value, tips }) {
    return (
        <Block padding='scale600'>
            <LabelMedium marginBottom='scale100' color='primary400' overrides={{
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
                <MetaItem label='下载数量：' value={meta.downloads} />
                <MetaItem label='关注数量：' value={meta.follows} />
                <MetaItem label='评测数量：' value={meta.reviews} />
                <MetaItem label='多数评价：' value={remark} tips={percent == 0 ? null : percent + '%'} />
            </Block>
        </Block>
    );
}

export default MetaBar;