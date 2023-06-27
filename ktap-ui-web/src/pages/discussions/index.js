import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from "baseui/block";
import { LabelXSmall, LabelSmall } from 'baseui/typography';
import { Button } from "baseui/button";
import { LAYOUT_MAIN, MOBILE_BREAKPOINT } from '../../constants';
import { Link } from 'react-router-dom';
import { Input } from 'baseui/input';
import { Search } from 'baseui/icon';
import { ChatAlt2, User } from '../../components/icons';

function Discussions() {
    const limit = 20;
    const [css, theme] = useStyletron();
    const [dataList, setDataList] = React.useState([]);
    const [hasMore, setHasMore] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [skip, setSkip] = React.useState(0);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                // const res = await fetch(`/api/discussions?limit=${limit}&skip=${skip}`);
                // if (res.ok) {
                // const json = await res.json();
                // setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                // setHasMore(json.skip + json.limit < json.count);
                setDataList([
                    { id: 1, name: '东游记之八仙过海', summary: '一场神奇的冒险，一段断肠的恋爱，一次无悔的选择', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', banner: 'https://cdn.discordapp.com/discovery-splashes/522681957373575168/6db394031cb9df0e683d1df33773d8b9.jpg?size=600', meta: { users: 32032, discussions: 3121, },},
                    { id: 2, name: '封神榜之神都游龙', summary: 'Welcome to Teyvat, Traveler! This is the place to discuss with others about', icon: 'https://cdn.discordapp.com/icons/662267976984297473/39128f6c9fc33f4c95a27d4c601ad7db.webp?size=80', banner: 'https://cdn.discordapp.com/discovery-splashes/322850917248663552/1de7a62f4ce7cdc98c3a9c6b575fa194.jpg?size=600', meta: { users: 421330, discussions: 3121, }, },
                    { id: 3, name: '无尽业海', summary: 'Welcome to Teyvat, Traveler! This is the place to discuss with others about your favorite game: Genshin Impact!', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', banner: 'https://cdn.discordapp.com/discovery-splashes/541484311354933258/d293f140d709e93cc5eab57ef23c2e14.jpg?size=600', meta: { users: 32110, discussions: 3121, }, },
                    { id: 4, name: '天下', summary: 'Welcome to Teyvat, Traveler! This is the place to discuss with others about your favorite game: Genshin Impact!', icon: 'https://cdn.discordapp.com/icons/522681957373575168/653957c5315ff8cace5a50e675f29a5d.webp?size=80', banner: 'https://cdn.discordapp.com/discovery-splashes/257785731072786435/b27a136f6fe6939af9699b1c31554158.jpg?size=600', meta: { users: 1320, discussions: 3121, }, },
                ]);
                setHasMore(true);
                // }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [skip]);

    return (
        <Block display='flex' flexDirection='column' width={LAYOUT_MAIN} marginTop='scale900' overrides={{
            Block: {
                style: {
                    [MOBILE_BREAKPOINT]: {
                        marginTop: theme.sizing.scale600,
                        width: '100%',
                        marginLeft: theme.sizing.scale300,
                        marginRight: theme.sizing.scale300,
                    }
                }
            }
        }}>
            <Block display='flex' justifyContent='center' alignItems='center' marginBottom='scale900' gridGap='scale300'>
                <Input size='default' placeholder='搜索感兴趣的内容...' />
                <Button size='default' kind='secondary'><Search /></Button>
            </Block>
            <Block display='grid' gridTemplateColumns='repeat(auto-fill,minmax(240px,1fr))' gridGap='scale300'>
                {dataList && dataList.map((app, index) => (
                    <Link key={index} to={`/discussions/apps/${app.id}`} className={css({
                        textDecoration: 'none',
                        display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative',
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderRadius: theme.borders.radius300,
                        boxShadow: theme.lighting.shadow700,
                    })}>
                        <div className={css({
                            width: '100%', paddingBottom: theme.sizing.scale800, position: 'relative',
                        })}>
                            <div className={css({
                                width: '100%', height: '138px',
                                borderTopLeftRadius: theme.borders.radius300, borderTopRightRadius: theme.borders.radius300,
                                backgroundImage: `url(${app.banner})`,
                                backgroundPosition: 'center center', backgroundSize: 'cover',
                            })} />
                            <div className={css({
                                backgroundColor: theme.colors.backgroundPrimary, padding: theme.sizing.scale100, marginLeft: theme.sizing.scale500,
                                position: 'absolute', bottom: theme.sizing.scale100, borderRadius: theme.borders.radius300,
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                            })}>
                                <img src={app.icon} className={css({ objectFit: 'cover', borderRadius: theme.borders.radius300, width: theme.sizing.scale1200, height: theme.sizing.scale1200 })} alt={app.name} />
                            </div>
                        </div>
                        <div className={css({
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.sizing.scale300,
                            padding: theme.sizing.scale600, overflow: 'hidden', width: '100%', flex: '1'
                        })}>
                            <Block display='flex' flexDirection='column' gridGap='scale200' width='100%' flex='1' marginBottom='scale300'>
                                <LabelSmall>{app.name}</LabelSmall>
                                <LabelXSmall color='primary300' width='100%' overflow='hidden' textOverflow='ellipsis' overrides={{
                                    Block: {
                                        style: {
                                            '-webkit-line-clamp': 4,
                                        }
                                    }
                                }}>{app.summary}</LabelXSmall>
                            </Block>
                            <Block display='flex' justifyContent='space-between' alignItems='center' width='100%'>
                                <LabelXSmall color='primary300' display='flex' alignItems='center' gridGap='scale0'><User width='16px' height='16px' />{app?.meta?.users} 人参与</LabelXSmall>
                                <LabelXSmall color='primary300' display='flex' alignItems='center' gridGap='scale0'><ChatAlt2 width='16px' height='16px' /> {app?.meta?.discussions} 个主题</LabelXSmall>
                            </Block>
                        </div>
                    </Link>
                ))}
            </Block>
            <Block
                marginTop='scale600'
                display='flex'
                justifyContent='center'
                alignItems='center'
            >
                <Button onClick={() => setSkip(prev => prev + limit)} kind='tertiary' isLoading={isLoading} disabled={!hasMore}>
                    {hasMore ? '查看更多' : '没有了'}
                </Button>
            </Block>
        </Block >
    );
}

export default Discussions;