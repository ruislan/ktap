import React from 'react';

import { Block } from 'baseui/block';
import { HeadingXSmall, ParagraphXSmall, } from 'baseui/typography';
import { Button } from 'baseui/button';
import { StyledDivider } from 'baseui/divider'
import { Select } from 'baseui/select';
import { useSnackbar } from 'baseui/snackbar';
import { Check, Delete, } from 'baseui/icon';
import { StatefulInput } from 'baseui/input';

import { PAGE_LIMIT_NORMAL } from '@ktap/libs/utils';
import Tag from '@ktap/components/tag';

function GenresBlock({ data }) {
    const { enqueue } = useSnackbar();
    const [isLoading, setIsLoading] = React.useState(true);
    const [genres, setGenres] = React.useState([]);
    const [genreOptions, setGenreOptions] = React.useState([]);
    const [newGenres, setNewGenres] = React.useState([]);

    React.useEffect(() => {
        const fetchGenreOptions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/tags/genres`);
                if (res.ok) {
                    const json = await res.json();
                    setGenreOptions(json.data);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchGenreOptions();
    }, []);

    React.useEffect(() => {
        const fetchGenres = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/admin/apps/${data.id}/genres`);
                if (res.ok) {
                    const json = await res.json();
                    setGenres(json.data);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchGenres();
    }, [data]);

    const handleSaveGenres = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/genres`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ genres: newGenres.map(genre => genre.id) })
            });
            if (res.ok) {
                enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                setGenres(prev => [...prev, ...newGenres]);
                setNewGenres([]);
            } else {
                enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/genres/${id}`, { method: 'DELETE' });
            if (res.ok) {
                enqueue({ message: '删除成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                setGenres(genres.filter(genre => genre.id !== id));
            } else {
                enqueue({ message: '删除失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Block width='100%' marginBottom='scale900' display='flex' flexDirection='column'>
            <HeadingXSmall marginTop='0' marginBottom='scale100'>类型</HeadingXSmall>
            <Block width='100%' marginBottom='scale0'><StyledDivider $size='cell' /></Block>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveGenres();
            }}>
                <Block display='flex' alignItems='center' gridGap='scale300' marginTop='scale300'>
                    <Block flex='1'>
                        <Select options={genreOptions.filter(option => !genres.find(genre => genre.name === option.name))}
                            getOptionLabel={({ option }) => option.name}
                            getValueLabel={({ option }) => option.name}
                            multi
                            size='compact'
                            value={newGenres}
                            filterOptions={(options, filterValue) => options.filter(option => option.name.toLowerCase().includes(filterValue.toLowerCase()))}
                            placeholder='请选择...'
                            onChange={params => setNewGenres(params.value)} />
                    </Block>
                    <Block><Button kind='secondary' size='compact' type='submit' disabled={!newGenres || newGenres.length === 0} isLoading={isLoading}>保存</Button></Block>
                </Block>
            </form>
            <Block marginTop='scale600' display='flex' alignItems='center' gridGap='scale300' flexWrap>
                {genres && genres.map((genre, index) => (
                    <Tag key={index} closeable onCloseClick={(e) => {
                        e.preventDefault();
                        handleDelete(genre.id);
                    }}>{genre.name}</Tag>
                ))}
            </Block>
        </Block>
    );
}


function FeaturesBlock({ data }) {
    const { enqueue } = useSnackbar();
    const [isLoading, setIsLoading] = React.useState(true);
    const [features, setFeatures] = React.useState([]);
    const [featureOptions, setFeatureOptions] = React.useState([]);
    const [newFeatures, setNewFeatures] = React.useState([]);

    React.useEffect(() => {
        const fetchFeatureOptions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/tags/features`);
                if (res.ok) {
                    const json = await res.json();
                    setFeatureOptions(json.data);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeatureOptions();
    }, []);

    React.useEffect(() => {
        const fetchFeatures = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/admin/apps/${data.id}/features`);
                if (res.ok) {
                    const json = await res.json();
                    setFeatures(json.data);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeatures();
    }, [data]);

    const handleSaveFeatures = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/features`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features: newFeatures.map(feature => feature.id) })
            });
            if (res.ok) {
                enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                setFeatures(prev => [...prev, ...newFeatures]);
                setNewFeatures([]);
            } else {
                enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsLoading(false);
        }
    };
    const handleDelete = async (id) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/features/${id}`, { method: 'DELETE' });
            if (res.ok) {
                enqueue({ message: '删除成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                setFeatures(features.filter(feature => feature.id !== id));
            } else {
                enqueue({ message: '删除失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Block width='100%' marginBottom='scale900' display='flex' flexDirection='column'>
            <HeadingXSmall marginTop='0' marginBottom='scale100'>功能</HeadingXSmall>
            <Block width='100%' marginBottom='scale0'><StyledDivider $size='cell' /></Block>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveFeatures();
            }}>
                <Block display='flex' alignItems='center' gridGap='scale300' marginTop='scale300'>
                    <Block flex='1'>
                        <Select options={featureOptions.filter(option => !features.find(feature => feature.name === option.name))}
                            getOptionLabel={({ option }) => option.name}
                            getValueLabel={({ option }) => option.name}
                            size='compact'
                            multi
                            placeholder='请选择...'
                            value={newFeatures}
                            filterOptions={(options, filterValue) => options.filter(option => option.name.toLowerCase().includes(filterValue.toLowerCase()))}
                            onChange={params => setNewFeatures(params.value)}
                        />
                    </Block>
                    <Block><Button kind='secondary' size='compact' type='submit' disabled={!newFeatures || newFeatures.length === 0} isLoading={isLoading}>保存</Button></Block>
                </Block>

            </form>
            <Block marginTop='scale600' display='flex' alignItems='center' gridGap='scale300' flexWrap>
                {features && features.map((feature, index) => (
                    <Tag key={index} closeable onCloseClick={(e) => {
                        e.preventDefault();
                        handleDelete(feature.id);
                    }}>{feature.name}</Tag>
                ))}
            </Block>
        </Block>
    );
}

function TagsBlock({ data }) {
    const limit = PAGE_LIMIT_NORMAL;
    const [isLoading, setIsLoading] = React.useState(true);
    const [tags, setTags] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const inputRef = React.useRef(null);

    const handleDelete = async (id) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/tags/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTags(prev => prev.filter(tag => tag.id !== id));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTags = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/tags?skip=${skip}&limit=${limit}&keyword=${inputRef.current.value}`);
            if (res.ok) {
                const json = await res.json();
                setTags(prev => skip === 0 ? json.data : [...prev, ...json.data]);
                setHasMore(json.skip + json.limit < json.count);
            }
        } finally {
            setIsLoading(false);
        }
    }, [data, skip, limit]);

    React.useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    return (
        <Block width='100%' marginBottom='scale900' display='flex' flexDirection='column'>
            <HeadingXSmall marginTop='0' marginBottom='scale100'>标签</HeadingXSmall>
            <Block width='100%' marginBottom='scale0'><StyledDivider $size='cell' /></Block>
            <ParagraphXSmall marginTop='0'>提示：添加标签不属于后台管理范围，如需要请到前台自行添加</ParagraphXSmall>
            <Block display='flex' alignItems='center' gridGap='scale300'>
                <Block flex='1'><StatefulInput inputRef={inputRef} size='compact' placeholder='输入关键词搜索' clearable /></Block>
                <Block><Button kind='secondary' size='compact' onClick={(e) => {
                    e.preventDefault();
                    skip > 0 ? setSkip(0) : fetchTags();
                }}>搜索</Button></Block>
            </Block>
            <Block marginTop='scale600' display='flex' flexWrap='wrap' gridGap='scale300'>
                {tags && tags.map((tag, index) => (
                    <Tag key={index} closeable onCloseClick={(e) => {
                        e.preventDefault();
                        handleDelete(tag.id);
                    }}>{tag.name}</Tag>
                ))}
                {hasMore && <Button kind='tertiary' size='compact' shape='circle' isLoading={isLoading} onClick={(e) => {
                    e.preventDefault();
                    setSkip(prev => prev + limit);
                }}>...</Button>}
            </Block>
        </Block>
    );
}

function AppDetailTags({ data }) {
    return (
        <Block display='flex' flexDirection='column' gridGap='scale300'>
            <GenresBlock data={data} />
            <FeaturesBlock data={data} />
            <TagsBlock data={data} />
        </Block >
    );
}

export default AppDetailTags;