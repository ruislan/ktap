import React from 'react';
import Tag from '../../components/tag';
import { Block } from 'baseui/block';
import { Button } from "baseui/button";
import { Skeleton } from 'baseui/skeleton';
import { LabelLarge, ParagraphMedium } from 'baseui/typography';
import { Star } from '../../components/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useStyletron } from 'baseui';
import { MOBILE_BREAKPOINT } from '../../constants';

const tips = ['查看更多', '我还要', '再看看', '再来', 'More, More', '再查，再探', '接着奏乐，接着舞'];

function Image({ src, alt }) {
    const [css,] = useStyletron();
    const [loaded, setLoaded] = React.useState(false);
    return (
        <>
            {!loaded && (<Skeleton width='100%' height='350px' animation overrides={{
                Root: {
                    style: {
                        borderTopLeftRadius: 'inherit',
                        borderTopRightRadius: 'inherit',
                        [MOBILE_BREAKPOINT]: {
                            height: '200px',
                        }
                    }
                }
            }} />)}
            <img className={
                css({
                    width: '100%', objectFit: 'cover',
                    borderTopLeftRadius: 'inherit',
                    borderTopRightRadius: 'inherit',
                    display: loaded ? 'block' : 'none',
                })
            } onLoad={() => setLoaded(true)} src={src} alt={alt} />
        </>
    );
}

function AppCard({ app }) {
    const [css, theme] = useStyletron();
    const navigate = useNavigate();
    return (
        <Link to={`/apps/${app.id}`} className={css({
            textDecoration: 'none', fontSize: 'inherit', lineHeight: 'inherit',
            color: 'inherit', display: 'flex', flexDirection: 'column',
            borderRadius: theme.sizing.scale300,
            backgroundColor: theme.colors.backgroundSecondary,
            boxShadow: theme.lighting.shadow600, width: '100%',
        })}>
            <Image src={app.media.landscape.image} alt={app.name} />
            <Block display='flex' flexDirection='column' paddingLeft='scale500' paddingRight='scale500' paddingBottom='scale500' paddingTop='scale300' gridGap='scale300'>
                <LabelLarge overrides={{
                    Block: {
                        style: () => ({
                            fontSize: theme.sizing.scale700,
                            lineHeight: theme.sizing.scale850,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        })
                    }
                }}>
                    <Block overrides={{
                        Block: {
                            style: {
                                fontSize: 'inherit',
                                lineHeight: 'inherit'
                            }
                        }
                    }}>
                        {app.name}
                    </Block>
                    <Block display='flex' justifyContent='center' alignItems='center'>
                        <Block marginRight='scale0' overrides={{
                            Block: {
                                style: {
                                    fontSize: 'inherit',
                                    lineHeight: 'inherit'
                                }
                            }
                        }}>
                            {app.score}
                        </Block>
                        <Star width='24px' height='24px' />
                    </Block>
                </LabelLarge>
                <ParagraphMedium color='primary100' marginTop='0' marginBottom='0'>{app.summary}</ParagraphMedium>
                <Block display='flex' gridGap='scale300' alignItems='center' flexWrap marginTop='0'>
                    {app.tags.map((tag, i) => (
                        <Tag key={i} onClick={(e) => {
                            e.preventDefault();
                            navigate(`/tags/${tag.name}`);
                        }}>
                            {tag.name}
                        </Tag>
                    ))}
                </Block>
            </Block>
        </Link>
    );
}

function AppListRecommend() {
    const limit = 10;
    const [dataList, setDataList] = React.useState([]);
    const [hasMore, setHasMore] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [skip, setSkip] = React.useState(0);

    React.useEffect(() => {
        const fetchApps = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/apps/recommended?limit=${limit}&skip=${skip}`);
                if (res.ok) {
                    const json = await res.json();
                    setDataList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                    setHasMore(json.skip + json.limit < json.count);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchApps();
    }, [skip]);

    return (
        <Block display='flex' flexDirection='column' width='100%'>
            <Block display='flex' flexDirection='column' gridGap='scale600'>
                {dataList.map((app, index) => (
                    <AppCard key={index} app={app} />
                ))}
            </Block>

            <Block marginTop='scale600' display='flex' justifyContent='center' alignItems='center'>
                <Button size='default' kind='tertiary' isLoading={isLoading} disabled={!hasMore} onClick={() => setSkip(prev => prev + limit)}>
                    {hasMore ? tips[Math.floor(Math.random() * tips.length) | 0] : '没有了'}
                </Button>
            </Block>
        </Block >
    );
}

export default AppListRecommend;
