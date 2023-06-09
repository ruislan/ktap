import React from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useStyletron } from 'baseui';

import { Block } from 'baseui/block';
import { LabelMedium } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import Tag from '../../components/tag';
import { Button } from 'baseui/button';
import { MOBILE_BREAKPOINT, LAYOUT_LEFT, LAYOUT_RIGHT } from '../../constants';
import RoundTab from '../../components/round-tab';
import Capsule from '../../components/capsule';
import { Star } from '../../components/icons';
import SideGenres from './side-genres';
import SideFeatures from './side-features';
import SideHotTags from './side-hot-tags';

function TagItem({ name }) {
    const navigate = useNavigate();
    return (
        <Tag onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/tags/${name}`);
            }}
        >
            {name}
        </Tag>
    );
}

function Tags() {
    const limit = 10;
    const [css, theme] = useStyletron();
    const { name } = useParams();
    const [flavor, setFlavor] = React.useState(0);
    const [skip, setSkip] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [appList, setAppList] = React.useState([]);
    const [hasMore, setHasMore] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const byWhat = flavor === 1 ? 'by-new' : (flavor === 2 ? 'by-score' : 'by-hot');
                const res = await fetch(`/api/tags/${name}?flavor=${byWhat}&skip=${skip}&limit=${limit}`);
                if (res.ok) {
                    const json = await res.json();
                    setAppList(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                    setHasMore(json.skip + json.limit < json.count);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [name, flavor, skip]);
    return (
        <Block display='flex' marginTop='scale900' overrides={{
            Block: {
                style: {
                    [MOBILE_BREAKPOINT]: {
                        display: 'flex',
                        flexDirection: 'column',
                        marginTop: theme.sizing.scale600,
                        width: '100%',
                    }
                }
            }
        }}>
            <Block width={LAYOUT_LEFT} margin='0 8px 0 0' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            margin: '0',
                            padding: $theme.sizing.scale300,
                            width: 'auto',
                        }
                    })
                }
            }}>
                <RoundTab activeKey={flavor} names={['按最热', '按最新', '按评分']} onChange={(e) => { setFlavor(e.activeKey); setSkip(0); }} />
                <Block display='flex' flexDirection='column'>
                    {appList && appList.map((app, index) => (
                        <Capsule key={index} href={`/apps/${app.id}`}>
                            <Block width='154px' height='86.5px'>
                                <img src={app.media.landscape.thumbnail} className={css({ width: '100%', height: '100%', borderRadius: theme.sizing.scale100 })} />
                            </Block>
                            <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600' paddingTop='scale100' flex={1} overflow='auto'
                                overrides={{
                                    Block: {
                                        style: {
                                            [MOBILE_BREAKPOINT]: {
                                                paddingLeft: theme.sizing.scale300,
                                                paddingRight: theme.sizing.scale300,
                                            }
                                        }
                                    }
                                }}>
                                <LabelMedium marginBottom='scale100'>{app.name}</LabelMedium>
                                <Block display='flex' alignItems='center' overrides={{
                                    Block: {
                                        style: {
                                            [MOBILE_BREAKPOINT]: {
                                                alignSelf: 'start',
                                            }
                                        }
                                    }
                                }}>
                                    <LabelMedium marginRight='scale0'>{app.score}</LabelMedium>
                                    <Star width='20px' height='20px' />
                                </Block>
                                <Block display='flex' overflow='auto' gridGap='scale300' alignItems='center' marginTop='scale300'>
                                    {app.tags && app.tags.map((tag, index) => <TagItem key={index} name={tag.name} />)}
                                    {app.genres && app.genres.map((tag, index) => <TagItem key={index} name={tag.name} />)}
                                    {app.features && app.features.map((tag, index) => <TagItem key={index} name={tag.name} />)}
                                </Block>
                            </Block>
                        </Capsule>
                    ))}
                </Block>
                {isLoading && <Block display='flex' justifyContent='center' marginTop='scale900' marginBottom='scale900'><Spinner $size='scale1600' $borderWidth='scale200' /></Block>}
                <Block marginTop='scale600' display='flex' justifyContent='center' alignItems='center'>
                    <Button size='default' kind='tertiary' onClick={() => setSkip(prev => prev + limit)} isLoading={isLoading} disabled={!hasMore}>
                        {hasMore ? '查看更多' : '没有了'}
                    </Button>
                </Block>
            </Block>
            <Block width={LAYOUT_RIGHT} margin='0 0 0 8px'
                overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            [MOBILE_BREAKPOINT]: {
                                marginTop: $theme.sizing.scale600,
                                marginRight: $theme.sizing.scale300,
                                width: 'auto',
                            }
                        })
                    }
                }}
            >
                <SideGenres />
                <SideFeatures />
                <SideHotTags />
            </Block>
        </Block>
    );
}

export default Tags;