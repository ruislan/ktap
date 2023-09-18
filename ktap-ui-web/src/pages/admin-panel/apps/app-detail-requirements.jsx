import React from 'react';

import { Block } from 'baseui/block';
import { HeadingXSmall, LabelMedium, LabelSmall } from 'baseui/typography';
import { Input } from 'baseui/input';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Checkbox } from 'baseui/checkbox';
import { useSnackbar } from 'baseui/snackbar';
import { Check, Delete } from 'baseui/icon';

import { MOBILE_BREAKPOINT } from '@ktap/libs/utils';

function RequirementBlock({ platform, onChange }) {
    return (
        <Block width='100%' marginBottom='scale600' display='flex' flexDirection='column'>
            <HeadingXSmall marginTop='0' marginBottom='scale600'>{platform.name}</HeadingXSmall>
            <Block display='grid' gridTemplateColumns='1fr 1fr' gridGap='scale300' overrides={{
                Block: {
                    style: {
                        [MOBILE_BREAKPOINT]: {
                            display: 'flex',
                            flexDirection: 'column',
                        }
                    }
                }
            }}>
                <Block display='flex' flexDirection='column'>
                    <LabelMedium marginBottom='scale600'>最小配置</LabelMedium>
                    {platform?.requirements && platform?.requirements.map((requirement, index) => (
                        <FormControl key={index} label={<LabelSmall>{requirement.name}</LabelSmall>}>
                            <Input size='compact' value={requirement.minimum || ''} onChange={e => {
                                e.preventDefault();
                                requirement.minimum = e.target.value;
                                onChange();
                            }} />
                        </FormControl>
                    ))}
                </Block>
                <Block display='flex' flexDirection='column'>
                    <LabelMedium marginBottom='scale600'>推荐配置</LabelMedium>
                    {platform?.requirements && platform?.requirements.map((requirement, index) => (
                        <FormControl key={index} label={<LabelSmall>{requirement.name}</LabelSmall>}>
                            <Input size='compact' value={requirement.recommended || ''} onChange={e => {
                                e.preventDefault();
                                requirement.recommended = e.target.value;
                                onChange();
                            }} />
                        </FormControl>
                    ))}
                </Block>
            </Block>
        </Block>
    );
}

function AppDetailRequirements({ data }) {
    const [isLoading, setIsLoading] = React.useState(true);
    const { enqueue } = useSnackbar();
    const [platformWin, setPlatformWin] = React.useState({
        name: 'Windows', checked: true, requirements: [
            { name: '操作系统', minimum: '', recommended: '' },
            { name: '处理器', minimum: '', recommended: '' },
            { name: '内存', minimum: '', recommended: '' },
            { name: '显卡', minimum: '', recommended: '' },
            { name: '存储空间', minimum: '', recommended: '' },
            { name: 'Direct 版本', minimum: '', recommended: '' },
        ],
    });
    const [platformMac, setPlatformMac] = React.useState({
        name: 'Macos', checked: false, requirements: [
            { name: '操作系统', minimum: '', recommended: '' },
            { name: '处理器', minimum: '', recommended: '' },
            { name: '内存', minimum: '', recommended: '' },
            { name: '显卡', minimum: '', recommended: '' },
            { name: '存储空间', minimum: '', recommended: '' }
        ],
    });
    const [platformLinux, setPlatformLinux] = React.useState({
        name: 'Linux', checked: false, requirements: [
            { name: '操作系统', minimum: '', recommended: '' },
            { name: '处理器', minimum: '', recommended: '' },
            { name: '内存', minimum: '', recommended: '' },
            { name: '显卡', minimum: '', recommended: '' },
            { name: '存储空间', minimum: '', recommended: '' },
        ],
    });

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${data.id}/platforms`);
            if (res.ok) {
                const json = await res.json();
                json.data.forEach(platform => {
                    if (platform?.requirements?.length > 0) {
                        switch (platform.os) {
                            case 'Windows':
                                setPlatformWin(prev => {
                                    prev.checked = true;
                                    prev.requirements = platform.requirements;
                                    return { ...prev };
                                });
                                break;
                            case 'Macos':
                                setPlatformMac(prev => {
                                    prev.checked = true;
                                    prev.requirements = platform.requirements;
                                    return { ...prev };
                                });
                                break;
                            case 'Linux':
                                setPlatformLinux(prev => {
                                    prev.checked = true;
                                    prev.requirements = platform.requirements;
                                    return { ...prev };
                                });
                                break;
                        }
                    }
                });
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
            const platforms = [];
            platformWin.checked && platforms.push({ os: 'Windows', requirements: platformWin.requirements });
            platformMac.checked && platforms.push({ os: 'Macos', requirements: platformMac.requirements });
            platformLinux.checked && platforms.push({ os: 'Linux', requirements: platformLinux.requirements });
            const res = await fetch(`/admin/apps/${data.id}/platforms`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ platforms })
            });
            if (res.ok) enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
            else enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Block display='flex' flexDirection='column' gridGap='scale300'>
            <Block display='flex' flexDirection='column' gridGap='scale300' marginBottom='scale900'>
                <HeadingXSmall marginTop='0' marginBottom='scale600'>选择支持的平台</HeadingXSmall>
                <Block display='flex' alignItems='center' gridGap='scale600'>
                    <Checkbox checked={platformWin.checked}
                        onChange={e => {
                            setPlatformWin(prev => {
                                const next = { ...prev };
                                next.checked = e.target.checked;
                                return next;
                            })
                        }}
                    >
                        {platformWin.name}
                    </Checkbox>
                    <Checkbox checked={platformMac.checked}
                        onChange={e => {
                            setPlatformMac(prev => {
                                const next = { ...prev };
                                next.checked = e.target.checked;
                                return next;
                            })
                        }}
                    >
                        {platformMac.name}
                    </Checkbox>
                    <Checkbox checked={platformLinux.checked}
                        onChange={e => {
                            setPlatformLinux(prev => {
                                const next = { ...prev };
                                next.checked = e.target.checked;
                                return next;
                            })
                        }}
                    >
                        {platformLinux.name}
                    </Checkbox>
                </Block>
            </Block>
            {platformWin.checked && <RequirementBlock platform={platformWin} onChange={() => setPlatformWin(prev => { return { ...prev }; })} />}
            {platformMac.checked && <RequirementBlock platform={platformMac} onChange={() => setPlatformMac(prev => { return { ...prev }; })} />}
            {platformLinux.checked && <RequirementBlock platform={platformLinux} onChange={() => setPlatformLinux(prev => { return { ...prev }; })} />}
            <Block display='flex'>
                <Block><Button kind='secondary' size='compact' type='submit' isLoading={isLoading} onClick={e => {
                    e.preventDefault();
                    handleSave();
                }}>保存</Button></Block>
            </Block>
        </Block >

    );
}

export default AppDetailRequirements;