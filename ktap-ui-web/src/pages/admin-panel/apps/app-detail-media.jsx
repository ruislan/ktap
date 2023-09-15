
import React from 'react';

import { Block } from 'baseui/block';
import { HeadingXSmall, LabelLarge, LabelMedium, LabelSmall, ParagraphXSmall } from 'baseui/typography';
import { Input } from 'baseui/input';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { StyledDivider } from 'baseui/divider';
import { useSnackbar } from 'baseui/snackbar';
import { Check, Delete } from 'baseui/icon';

import { AppMedia, MOBILE_BREAKPOINT } from '@ktap/libs/utils';
import { Icon, TrashBin } from '@ktap/components/icons';

function collectMediaItem(data, type) {
    return data.filter(item => item.usage === type).map(item => {
        return {
            image: item.image,
            thumbnail: item.thumbnail,
            video: item.video,
        };
    });
}

function ImagePlaceholder({ src, width, height, type }) {
    width = width || '460';
    height = height || '215';
    type = type || 'image';
    const [srcUrl, setSrcUrl] = React.useState('');
    React.useEffect(() => {
        setSrcUrl(src);
    }, [src]);
    return (
        <Block display='flex' alignItems='baseline' width='100%' height='auto'>
            {type === 'video' ?
                (<video src={srcUrl} width='100%' height='auto' controls />) :
                (<img src={srcUrl} width='100%' height='auto' onError={() => setSrcUrl(`https://placehold.co/${width}x${height}/png`)} />)
            }
        </Block>
    );
}

function ImageBlock({ type, data, appId, title, originWidth, originHeight, thumbnailWidth, thumbnailHeight, responsive }) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [image, setImage] = React.useState('');
    const [thumbnail, setThumbnail] = React.useState('');
    const { enqueue } = useSnackbar();
    React.useEffect(() => {
        setImage(data?.image || '');
        setThumbnail(data?.thumbnail || '');
    }, [data]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${appId}/media/${type}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image,
                    thumbnail,
                }),
            });
            if (res.ok) enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
            else enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Block display='flex' marginBottom='scale900' flexDirection='column'>
            <form onSubmit={e => {
                e.preventDefault();
                handleSave();
            }}>
                <HeadingXSmall marginTop='0' marginBottom='scale100'>{title}</HeadingXSmall>
                <Block width='100%' marginBottom='scale0'><StyledDivider $size='cell' /></Block>
                <FormControl label={<LabelSmall>原图</LabelSmall>} caption={`${originWidth}x${originHeight}`}>
                    <Input size='compact' placeholder='原图' value={image} required clearable onChange={e => setImage(e.target.value)} />
                </FormControl>
                <FormControl label={<LabelSmall>缩略图</LabelSmall>} caption={`${thumbnailWidth}x${thumbnailHeight}`}>
                    <Input size='compact' placeholder='缩略图' value={thumbnail} required clearable onChange={e => setThumbnail(e.target.value)} />
                </FormControl>
                <Block display='grid' gridTemplateColumns='2fr 1fr' gridGap='scale300' marginBottom='scale900' overrides={{
                    Block: {
                        style: {
                            [MOBILE_BREAKPOINT]: {
                                display: responsive ? 'flex' : 'grid',
                                flexDirection: responsive ? 'column' : 'unset',
                            }
                        }
                    }
                }}>
                    <ImagePlaceholder src={image} width={originWidth} height={originHeight} type='image' />
                    <ImagePlaceholder src={thumbnail} width={thumbnailWidth} height={thumbnailHeight} type='image' />
                </Block>
                <Block display='flex'>
                    <Block><Button kind='secondary' size='compact' type='submit' isLoading={isLoading}>保存</Button></Block>
                </Block>
            </form>
        </Block>
    );
}

function GalleryBlock({ appId, galleryImages, galleryVideo, }) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [images, setImages] = React.useState([]);
    const [video, setVideo] = React.useState([]);
    const { enqueue } = useSnackbar();

    React.useEffect(() => {
        setImages(galleryImages);
        setVideo(galleryVideo);
    }, [galleryImages, galleryVideo]);


    const handleSave = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/apps/${appId}/media/gallery`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ video, images })
            });
            if (res.ok) enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
            else enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            setIsLoading(true);
            handleSave();
        }}>
            <Block width='100%' marginBottom='scale600' display='flex' flexDirection='column'>
                <Block display='flex' justifyContent='space-between' alignItems='center'>
                    <HeadingXSmall marginTop='0' marginBottom='scale100'>画廊 ({galleryVideo.length + galleryImages.length})</HeadingXSmall>
                    <Block display='flex' gridGap='scale300'>
                        <Button size='mini' kind='secondary' onClick={e => {
                            e.preventDefault();
                            setVideo(prev => {
                                prev.push({ image: '', thumbnail: '', video: '' });
                                return [...prev];
                            });
                        }}>加视频</Button>
                        <Button size='mini' kind='secondary' onClick={e => {
                            e.preventDefault();
                            setImages(prev => {
                                prev.push({ image: '', thumbnail: '' });
                                return [...prev];
                            });
                        }}>加图片</Button>
                    </Block>
                </Block>
                <Block width='100%' marginBottom='scale0'><StyledDivider $size='cell' /></Block>
                <LabelLarge marginTop='scale300' marginBottom='scale300'>视频</LabelLarge>
                {galleryVideo && galleryVideo.map((item, index) => (
                    <Block key={index} display='flex' flexDirection='column' marginBottom='scale600'>
                        <Block display='flex' justifyContent='space-between' alignItems='center'>
                            <LabelMedium>{index + 1}</LabelMedium>
                            <Button size='mini' kind='tertiary' shape='circle' onClick={e => {
                                e.preventDefault();
                                setVideo(prev => {
                                    prev.splice(index, 1);
                                    return [...prev];
                                });
                            }}>
                                <Icon><TrashBin /></Icon>
                            </Button>
                        </Block>
                        <FormControl label={<LabelSmall>视频</LabelSmall>}>
                            <Input size='compact' placeholder='视频' required value={item.video} onChange={e => setVideo(prev => {
                                prev[index].video = e.target.value
                                return [...prev];
                            })} />
                        </FormControl>
                        <Block display='flex' marginBottom='scale300'>
                            <ImagePlaceholder src={item.video} width='2560' height='1440' type='video' />
                        </Block>
                        <FormControl label={<LabelSmall>封面</LabelSmall>} caption='2560x1440'>
                            <Input size='compact' placeholder='封面' required value={item.image} onChange={e => setVideo(prev => {
                                prev[index].image = e.target.value
                                return [...prev];
                            })} />
                        </FormControl>
                        <FormControl label={<LabelSmall>封面缩略图</LabelSmall>} caption='616x353'>
                            <Input size='compact' placeholder='封面缩略图' required value={item.thumbnail} onChange={e => setVideo(prev => {
                                prev[index].thumbnail = e.target.value
                                return [...prev];
                            })} />
                        </FormControl>
                        <Block display='grid' gridTemplateColumns='2fr 1fr' gridGap='scale300' marginBottom='scale600'>
                            <ImagePlaceholder src={item.image} width='2560' height='1440' type='image' />
                            <ImagePlaceholder src={item.thumbnail} width='616' height='353' type='image' />
                        </Block>
                    </Block>
                ))}
                <LabelLarge marginTop='scale300' marginBottom='scale300'>图片</LabelLarge>

                {galleryImages && galleryImages.map((item, index) => (
                    <Block key={index} display='flex' flexDirection='column' marginBottom='scale600'>
                        <Block display='flex' justifyContent='space-between' alignItems='center'>
                            <LabelMedium>{index + 1}</LabelMedium>
                            <Button size='mini' kind='tertiary' shape='circle' onClick={e => {
                                e.preventDefault();
                                setImages(prev => {
                                    prev.splice(index, 1);
                                    return [...prev];
                                });
                            }}>
                                <Icon><TrashBin /></Icon>
                            </Button>
                        </Block>
                        <FormControl label={<LabelSmall>原图</LabelSmall>} caption='2560x1440'>
                            <Input size='compact' placeholder='原图' required value={item.image} onChange={e => setImages(prev => {
                                prev[index].image = e.target.value
                                return [...prev];
                            })} />
                        </FormControl>
                        <FormControl label={<LabelSmall>缩略图</LabelSmall>} caption='616x353'>
                            <Input size='compact' placeholder='缩略图' required value={item.thumbnail} onChange={e => setImages(prev => {
                                prev[index].thumbnail = e.target.value
                                return [...prev];
                            })} />
                        </FormControl>
                        <Block display='grid' gridTemplateColumns='2fr 1fr' gridGap='scale300' marginBottom='scale600'>
                            <ImagePlaceholder src={item.image} width='2560' height='1440' type='image' />
                            <ImagePlaceholder src={item.thumbnail} width='616' height='353' type='image' />
                        </Block>
                    </Block>
                ))}
            </Block>
            <Block display='flex'>
                <Block><Button kind='secondary' size='compact' type='submit' isLoading={isLoading}>保存</Button></Block>
            </Block>
        </form>
    );
}

function AppDetailInfo({ data }) {
    const [head, setHead] = React.useState({ image: '', thumbnail: '' });
    const [landscape, setLandscape] = React.useState({ image: '', thumbnail: '' });
    const [portrait, setPortrait] = React.useState({ image: '', thumbnail: '' });
    const [logo, setLogo] = React.useState({ image: '', thumbnail: '' });
    const [galleryImages, setGalleryImages] = React.useState([]);
    const [galleryVideo, setGalleryVideo] = React.useState('');

    const fetchMedia = React.useCallback(async () => {
        const res = await fetch(`/admin/apps/${data.id}/media`);
        if (res.ok) {
            const json = await res.json();

            setHead(collectMediaItem(json.data, AppMedia.usage.head)[0]);
            setLandscape(collectMediaItem(json.data, AppMedia.usage.landscape)[0]);
            setPortrait(collectMediaItem(json.data, AppMedia.usage.portrait)[0]);
            setLogo(collectMediaItem(json.data, AppMedia.usage.logo)[0]);
            setGalleryVideo(collectMediaItem(json.data.filter(item => item.type === 'video'), AppMedia.usage.gallery));
            setGalleryImages(collectMediaItem(json.data.filter(item => item.type === 'image'), AppMedia.usage.gallery));
        }
    }, [data]);

    React.useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    return (
        <Block display='flex' flexDirection='column'>
            <ParagraphXSmall color='primary200'>建议：首先将图片上传到指定目录下，得到在线链接之后，再在下方进行设置。</ParagraphXSmall>
            <Block width='100%' marginBottom='scale600' display='flex' flexDirection='column'>
                <ImageBlock type='head' data={head} appId={data.id} title='头图' originWidth='460' originHeight='215' thumbnailWidth='292' thumbnailHeight='136' />
                <ImageBlock type='landscape' data={landscape} appId={data.id} title='横图' originWidth='2560' originHeight='1440' thumbnailWidth='616' thumbnailHeight='353' />
                <ImageBlock type='portrait' data={portrait} appId={data.id} title='竖图' originWidth='1200' originHeight='1600' thumbnailWidth='374' thumbnailHeight='448' responsive={false} />
                <ImageBlock type='logo' data={logo} appId={data.id} title='Logo' originWidth='400' originHeight='400' thumbnailWidth='128' thumbnailHeight='128' responsive={false} />
            </Block>
            <GalleryBlock appId={data.id} galleryImages={galleryImages} galleryVideo={galleryVideo} />
        </Block>
    );
}

export default AppDetailInfo;