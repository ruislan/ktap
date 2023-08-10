import React from 'react';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LabelLarge, ParagraphMedium } from 'baseui/typography';
import { Star } from '../../components/icons';
import { Link, useNavigate } from 'react-router-dom';
import Image from '../../components/image';
import Tag from '../../components/tag';
import { PAGE_LIMIT_NORMAL } from '../../constants';
import LoadMore from '../../components/load-more';

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
            <Image src={app.media.landscape.image} alt={app.name} width='100%' height='100%' skeletonWidth='100%' skeletonHeight='350px' />
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
    const limit = PAGE_LIMIT_NORMAL;
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
    }, [skip, limit]);

    return (
        <Block display='flex' flexDirection='column' width='100%'>
            <Block display='flex' flexDirection='column' gridGap='scale600'>
                {dataList.map((app, index) => (
                    <AppCard key={index} app={app} />
                ))}
            </Block>
            <LoadMore isLoading={isLoading} hasMore={hasMore} skeletonHeight='450px' onClick={() => setSkip(prev => prev + limit)} />
        </Block >
    );
}

export default AppListRecommend;
