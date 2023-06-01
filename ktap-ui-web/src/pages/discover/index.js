import React from 'react';

import { Block } from 'baseui/block';
import { MOBILE_BREAKPOINT, LAYOUT_MAIN, PageWidget } from '../../constants';
import TextList from './text-list';
import Carousel from './carousel';
import CardListApp from './card-list-app';
import CardListReview from './card-list-review';

function Discover() {
    const [components, setComponent] = React.useState([]);
    React.useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/discover');
                if (res.ok) {
                    const json = await res.json();
                    setComponent(json.data);
                }
            } finally {
                // ignore
            }
        })();
    }, []);
    return (
        <Block overrides={{
            Block: {
                style: ({ $theme }) => ({
                    display: 'flex',
                    marginTop: $theme.sizing.scale900,
                    justifyContent: 'center',
                    flexDirection: 'column',
                    width: LAYOUT_MAIN,
                    [MOBILE_BREAKPOINT]: {
                        width: '100%',
                        marginTop: $theme.sizing.scale600,
                    },
                })
            }
        }}>
            {
                components && components.map((component, index) => {
                    let dataList = [];
                    switch (component.type) {
                        case 'Carousel':
                            if (PageWidget.target.ids.App === component.dataType) {
                                dataList = component.data?.map(item => {
                                    return { ...item, link: `/apps/${item.id}`, image: item.media?.landscape?.image, tags: [...item.genres, ...item.features] };
                                });
                                return <Carousel key={index} title={component.title} dataList={dataList} />;
                            }
                            if (PageWidget.target.ids.Review === component.dataType) {
                                dataList = component.data?.map(item => {
                                    return { ...item.app, link: `/apps/${item.id}`, image: item.app.media.landscape.image, tags: [...item.app.genres, ...item.app.features] };
                                });
                                return <Carousel key={index} title={component.title} dataList={dataList} />;
                            }
                            return null;
                        case 'CardList':
                            if (PageWidget.target.ids.App === component.dataType) {
                                dataList = component.data?.map(item => {
                                    return { ...item, link: `/apps/${item.id}`, image: item.media.head.image, tags: [...item.genres, ...item.features] };
                                });
                                return <CardListApp key={index} title={component.title} dataList={dataList} perViewSize={'Two' === component.style ? 2 : 4} />;
                            }
                            if (PageWidget.target.ids.Review === component.dataType) {
                                dataList = component.data?.map(item => {
                                    return { ...item, link: `/reviews/${item.id}`, image: item.app.media.head.image };
                                });
                                return <CardListReview key={index} title={component.title} dataList={dataList} />;
                            }
                            return null;
                        case 'TextList':
                            if (PageWidget.target.ids.App === component.dataType) {
                                dataList = component.data?.map(item => {
                                    return { ...item, link: `/apps/${item.id}` };
                                });
                                return <Carousel key={index} title={component.title} dataList={dataList} />;
                            }
                            if (PageWidget.target.ids.Tag === component.dataType) {
                                dataList = component.data?.map(item => {
                                    return { ...item, link: `/tags/${item.name}` };
                                });
                                return <TextList key={index} title={component.title} dataList={dataList} />
                            }
                            return null;
                        default: return null;
                    }
                })
            }
        </Block>
    );
}

export default Discover;