import React from 'react';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import { Select } from 'baseui/select';
import { HeadingSmall, LabelMedium } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import { useSnackbar } from 'baseui/snackbar';
import { Check, ChevronDown, ChevronUp, Delete, Plus } from 'baseui/icon';
import { FormControl } from 'baseui/form-control';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';

import { MOBILE_BREAKPOINT, PageWidget } from '@ktap/libs/utils';
import { Eye } from '@ktap/components/icons';

function DiscoverWidget({ widget, onChanged, onSaved, onDeleted }) {
    const { enqueue } = useSnackbar();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const url = widget.id ? `/admin/discover/${widget.id}` : '/admin/discover';
            const method = widget.id ? 'PUT' : 'POST';
            const res = await fetch(url, { method, body: JSON.stringify(widget), headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                if (method === 'POST') {
                    const json = await res.json();
                    onSaved({ data: { ...json.data, isCollapsed: false } });
                }
                enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
            } else {
                enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (widget.id) {
            try {
                setIsLoading(true);
                const res = await fetch(`/admin/discover/${widget.id}`, { method: 'DELETE' });
                if (res.ok) {
                    enqueue({ message: '删除成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, });
                    onDeleted();
                    setIsOpenDeleteConfirmModal(false);
                } else {
                    enqueue({ message: '删除失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, });
                }
            } finally {
                setIsLoading(false);
            }
        } else {
            onDeleted();
            setIsOpenDeleteConfirmModal(false);
            enqueue({ message: '删除成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, });
        }
    }

    return (
        <Block display='flex' flexDirection='column' padding='scale600' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    borderColor: $theme.borders.border300.borderColor,
                    borderWidth: $theme.borders.border300.borderWidth,
                    borderStyle: $theme.borders.border300.borderStyle,
                    borderRadius: $theme.borders.radius300,
                })
            }
        }}>
            {widget.isCollapsed ?
                <Block display='flex' alignItems='center' justifyContent='space-between'>
                    <LabelMedium>{widget.title}</LabelMedium>
                    <Block display='flex'>
                        <Button size='compact' kind='tertiary' isLoading={isLoading} onClick={e => {
                            e.preventDefault();
                            onChanged({ data: { ...widget, isCollapsed: false } });
                        }}><ChevronDown /></Button>
                    </Block>
                </Block> :
                <>
                    <FormControl label='标题' caption=''>
                        <Input size='compact' placeholder='标题' value={widget.title} onChange={e => {
                            onChanged({ data: { ...widget, title: e.target.value } });
                        }} />
                    </FormControl>
                    <Block display='grid' gridTemplateColumns='1fr 1fr' gridGap='scale300'>
                        <Block>
                            <FormControl label='类型' caption=''>
                                <Select type='select' closeOnSelect size='compact' clearable={false} required
                                    options={PageWidget.type.options}
                                    value={[{ label: PageWidget.type.getDisplayLabel(`${widget.type}-${widget.style}`), id: `${widget.type}-${widget.style}` }]}
                                    onChange={params => {
                                        const values = params.value[0].id.split('-');
                                        onChanged({ data: { ...widget, type: values[0], style: values[1] } });
                                    }}
                                />
                            </FormControl>
                        </Block>
                        <Block>
                            <FormControl label='内容对象'>
                                <Select type='select' closeOnSelect size='compact' required clearable={false}
                                    options={PageWidget.target.options}
                                    value={[{ label: PageWidget.target.getDisplayLabel(widget.target), id: widget.target }]}
                                    onChange={params => {
                                        onChanged({ data: { ...widget, target: params.value[0].id } });
                                    }}
                                />
                            </FormControl>
                        </Block>
                    </Block>
                    <FormControl label='内容' caption='ID列表，逗号分隔'>
                        <Input size='compact' placeholder='1,2,3...' value={widget.targetIds}
                            onChange={e => {
                                const value = e.target.value;
                                onChanged({ data: { ...widget, targetIds: value } });
                            }} />
                    </FormControl>
                    <Block display='flex' justifyContent='space-between'>
                        <Block display='flex' gridGap='scale300' alignItems='center'>
                            <Button size='compact' kind='tertiary' isLoading={isLoading} onClick={e => {
                                e.preventDefault();
                                setIsOpenDeleteConfirmModal(true);
                            }}>删除</Button>
                            <Button size='compact' kind='secondary' isLoading={isLoading} disabled={widget.title.length === 0 || widget.targetIds.length === 0} onClick={e => {
                                e.preventDefault();
                                handleSave();
                            }}>保存</Button>
                        </Block>
                        <Block display='flex' gridGap='scale300' alignItems='center'>
                            <Button size='compact' kind='tertiary' isLoading={isLoading} onClick={e => {
                                e.preventDefault();
                                onChanged({ data: { ...widget, isCollapsed: true } });
                            }}><ChevronUp /></Button>
                        </Block>
                    </Block>

                    <Modal onClose={() => setIsOpenDeleteConfirmModal(false)}
                        closeable={false}
                        isOpen={isOpenDeleteConfirmModal}
                        animate
                        autoFocus
                        role={ROLE.alertdialog}
                    >
                        <ModalHeader>是否删除板块？</ModalHeader>
                        <ModalBody>您确定要删除这个板块吗？该操作<b>不能撤消</b>。</ModalBody>
                        <ModalFooter>
                            <ModalButton kind='tertiary' onClick={() => setIsOpenDeleteConfirmModal(false)}>取消</ModalButton>
                            <ModalButton onClick={() => handleDelete()} isLoading={isLoading}>确定</ModalButton>
                        </ModalFooter>
                    </Modal>
                </>
            }
        </Block>
    );
}

function AdminPanelDiscover() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [widgets, setWidgets] = React.useState([]);

    React.useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const res = await fetch('/admin/discover');
                if (res.ok) {
                    const json = await res.json();
                    setWidgets(json.data.map(item => ({ ...item, isCollapsed: true })));
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    return (
        <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600'>
            <HeadingSmall marginTop='0' marginBottom='scale900'>探索页编辑</HeadingSmall>
            <Block display='flex' alignItems='center' justifyContent='flex-end' marginBottom='scale900' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            flexDirection: 'column', alignItems: 'flex-start',
                            justifyContent: 'flex-start', gap: $theme.sizing.scale600,
                        }
                    })
                }
            }}>
                <Block display='flex' alignItems='center' gridGap='scale300'>
                    <Button kind='secondary' size='mini' shape='circle' $as='a' href='/discover' target='_blank' ><Eye width={16} height={16} title='查看' /></Button>
                </Block>
            </Block>
            {isLoading ?
                <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'>
                    <Spinner $size='scale1600' $borderWidth='scale300' $color='primary' />
                </Block> :
                <Block display='flex' flexDirection='column' gridGap='scale300'>
                    {widgets && widgets.map((widget, index) => {
                        return (<DiscoverWidget key={index} widget={widget}
                            onChanged={({ data }) => {
                                setWidgets(prev => {
                                    const newWidgets = [...prev];
                                    newWidgets[index] = data;
                                    return newWidgets;
                                });
                            }}
                            onSaved={({ data }) => {
                                setWidgets(prev => {
                                    const newWidgets = [...prev];
                                    newWidgets[index] = data;
                                    return newWidgets;
                                });
                            }}
                            onDeleted={() => {
                                setWidgets(prev => {
                                    const newWidgets = [...prev];
                                    newWidgets.splice(index, 1);
                                    return newWidgets;
                                });
                            }} />)
                    })}
                </Block>
            }
            <Block display='flex' alignItems='center' justifyContent='center' marginTop='scale900'>
                <Button kind='secondary' size='compact' onClick={e => {
                    e.preventDefault();
                    setWidgets(prev => {
                        const newWidgets = [...prev];
                        newWidgets.push({
                            type: PageWidget.type.ids.CardList,
                            title: '', target: PageWidget.target.ids.App, targetIds: '', style: PageWidget.style.ids.Standard,
                        });
                        return newWidgets;
                    });
                }} startEnhancer={() => <Plus width={16} height={16} title='增加组件' />}>增加组件</Button>
            </Block>
        </Block >
    );
}

export default AdminPanelDiscover;