import { Link } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelMedium } from 'baseui/typography';

import { Icon, Star } from './icons';
import { MOBILE_BREAKPOINT } from '@ktap/libs/utils';

function LinkBox({ href, children }) {
    const [css, theme] = useStyletron();
    return <Link to={href} className={css({
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        backgroundColor: theme.colors.backgroundSecondary,
        color: 'inherit', textDecoration: 'none',
        borderRadius: theme.borders.radius300,
        [MOBILE_BREAKPOINT]: { padding: theme.sizing.scale0, }
    })}>
        {children}
    </Link>;
}

export default function AppCardGlance({ app }) {
    const [css, theme] = useStyletron();

    if (!app) return <LinkBox href='#'><LabelMedium padding='scale300' color='primary400'>该游戏暂不可见</LabelMedium></LinkBox>;

    return (
        <LinkBox href={`/apps/${app.id}`}>
            {app.media?.head?.image && <Block width='100%' maxHeight='168px' overflow='hidden'>
                <img src={app.media.head.image} className={css({ objectFit: 'cover', width: '100%', height: '100%', borderRadius: theme.borders.radius300 })} />
            </Block>}
            <Block display='flex' justifyContent='space-between' alignItems='center' padding='scale300'>
                <Block display='flex' alignItems='center'>
                    {app.media?.logo?.image &&
                        <Block width='scale1600' height='scale1600'>
                            <img src={app.media.logo.image} style={{
                                borderRadius: theme.sizing.scale500, boxShadow: 'rgb(0 0 0) 0px 0px 2px 2px', objectFit: 'cover',
                                width: '100%', height: '100%',
                            }} />
                        </Block>
                    }
                    <Block paddingLeft='scale400' display='flex' flexDirection='column'>
                        <LabelMedium marginBottom='scale100' overrides={{
                            Block: {
                                style: {

                                    whiteSpace: 'break-spaces',
                                }
                            }
                        }}>{app.name}</LabelMedium>
                        <Block display='flex' alignItems='center' justifyContent='flex-start'>
                            <Block marginRight='scale0' font='font300'>{app.score}</Block>
                            <Icon><Star /></Icon>
                        </Block>
                    </Block>
                </Block>
            </Block>
        </LinkBox>
    );
}