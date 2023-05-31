import React from 'react';

import { Block } from 'baseui/block';
import { LabelSmall, LabelXSmall } from 'baseui/typography';
import { useStyletron } from 'baseui';
import { Skeleton } from 'baseui/skeleton';
import SideBox from './side-box';
import { Link } from 'react-router-dom';

function SideBoxApps({ title, apiUrl }) {
    const [css, theme] = useStyletron();
    const [dataList, setDataList] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
        if (apiUrl) {
            (async () => {
                setIsLoading(true);
                try {
                    const res = await fetch(apiUrl + '?limit=10');
                    if (res.ok) {
                        const json = await res.json();
                        setDataList(json.data || []);
                    }
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, [apiUrl]);
    return (
        <SideBox title={title}>
            <Block display='grid' gridGap='scale100' gridTemplateColumns='1fr 1fr' paddingLeft='scale300' paddingBottom='scale600' paddingRight='scale300'>
                {isLoading ?
                    <Skeleton width="100%" height="380px" animation />
                    :
                    dataList.map((app, i) => (
                        <Block key={i} width='100%'>
                            <Link to={`/apps/${app.id}`}
                                className={css({
                                    display: 'flex',
                                    flexDirection: 'column',
                                    paddingLeft: theme.sizing.scale100,
                                    paddingRight: theme.sizing.scale100,
                                    paddingTop: theme.sizing.scale100,
                                    borderRadius: theme.borders.radius300,
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    ':hover': {
                                        backgroundColor: theme.colors.backgroundTertiary
                                    }
                                })}
                            >
                                <Block display='flex' width='100%' height='scale1800'>
                                    <img
                                        width='100%' height='100%'
                                        className={css({
                                            borderRadius: theme.borders.radius200,
                                        })}
                                        src={app.media.landscape.thumbnail}
                                    />
                                </Block>
                                <Block paddingRight='scale300' paddingTop='scale300' paddingBottom='scale300'>
                                    <LabelSmall marginBottom='scale100'>{app.name}</LabelSmall>
                                    <LabelXSmall color='primary300' whiteSpace='nowrap' overflow='hidden' textOverflow='ellipsis'>{app.slogan || app.summary}</LabelXSmall>
                                </Block>
                            </Link>
                        </Block>
                    ))}
            </Block>
        </SideBox>
    );
}

export default SideBoxApps;