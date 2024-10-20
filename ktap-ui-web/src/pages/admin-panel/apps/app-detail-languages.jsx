import React from 'react';

import { Block } from 'baseui/block';
import { HeadingXSmall, ParagraphSmall, } from 'baseui/typography';
import { Button } from 'baseui/button';
import { useSnackbar } from 'baseui/snackbar';
import { FormControl } from 'baseui/form-control';
import { Textarea } from 'baseui/textarea';
import { Delete, Check } from 'baseui/icon';

function AppDetailLanguages({ data }) {
    const { enqueue } = useSnackbar();
    const [isLoading, setIsLoading] = React.useState(true);
    const [text, setText] = React.useState('');
    const [audio, setAudio] = React.useState('');
    const [caption, setCaption] = React.useState('');

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/languages`);
            if (res.ok) {
                const json = await res.json();
                setText(json.data?.text || '');
                setAudio(json.data?.audio || '');
                setCaption(json.data?.caption || '');
            }
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/languages`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text.split(',').map(x => x.trim()).join(','),
                    audio: audio.split(',').map(x => x.trim()).join(','),
                    caption: caption.split(',').map(x => x.trim()).join(','),
                }),
            });
            if (res.ok) enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
            else enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Block display='flex' flexDirection='column' gridGap='scale300'>
            <HeadingXSmall marginTop='0' marginBottom='0'>参考语言</HeadingXSmall>
            <ParagraphSmall>简体中文, 繁体中文, English, 日本语, 한글, Français, Deutsch, Español, Português, русский язык, Italiano, Svenska, Nederlands</ParagraphSmall>
            <FormControl label='文本' caption='用","号隔开'>
                <Textarea value={text} onChange={e => setText(e.target.value)} />
            </FormControl>
            <FormControl label='语音' caption='用","号隔开'>
                <Textarea value={audio} onChange={e => setAudio(e.target.value)} />
            </FormControl>
            <FormControl label='字幕' caption='用","号隔开'>
                <Textarea value={caption} onChange={e => setCaption(e.target.value)} />
            </FormControl>
            <Block display='flex' marginTop='scale600'>
                <Block><Button kind='secondary' size='compact' type='submit' isLoading={isLoading} onClick={e => {
                    e.preventDefault();
                    handleSave();
                }}>保存</Button></Block>
            </Block>
        </Block >

    );
}

export default AppDetailLanguages;