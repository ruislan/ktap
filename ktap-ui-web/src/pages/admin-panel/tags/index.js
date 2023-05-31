import React from 'react';
import dayjs from 'dayjs';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Select } from 'baseui/select';
import { HeadingSmall, LabelSmall } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { EditLine, Eye, TrashBin } from '../../../components/icons';
import { ArrowLeft, ArrowRight, Check, Filter, Plus, Delete } from 'baseui/icon';
import { useStyletron } from 'baseui/styles';
import { StatefulPopover } from 'baseui/popover';
import { OptionList, StatefulMenu } from 'baseui/menu';
import { MOBILE_BREAKPOINT, Tag } from '../../../constants';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';

function AdminPanelTags() {
    const limit = 10;
    const { enqueue } = useSnackbar();
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(true);
    const [reviews, setReviews] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasNext, setHasNext] = React.useState(false);
    const [hasPrev, setHasPrev] = React.useState(false);
    const [keyword, setKeyword] = React.useState('');
    const keywordRef = React.useRef(null);
    const [isGenre, setIsGenre] = React.useState(true);
    const [isFeature, setIsFeature] = React.useState(true);
    const [isNormal, setIsNormal] = React.useState(true);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState(null);

    const [tag, setTag] = React.useState(null);
    const [isOpenEditModal, setIsOpenEditModal] = React.useState(false);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/tags?keyword=${keywordRef.current.value || ''}&isGenre=${isGenre}&isFeature=${isFeature}&isNormal=${isNormal}&skip=${skip}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                setReviews(json.data);
                setHasNext(json.skip + json.limit < json.count);
                setHasPrev(json.skip + json.limit > json.limit);
            }
        } finally {
            setIsLoading(false);
        }
    }, [skip, isGenre, isFeature, isNormal]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async () => {
        if (!selectedId) return;
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/tags/${selectedId}`, { method: 'DELETE' });
            if (res.ok) {
                enqueue({ message: '删除成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                fetchData();
            } else {
                enqueue({ message: '删除失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsOpenDeleteConfirmModal(false);
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!tag.name) return;
        try {
            setIsLoading(true);
            const url = tag.id ? `/admin/tags/${tag.id}` : '/admin/tags';
            const method = tag.id ? 'PUT' : 'POST';
            const res = await fetch(url, { method, body: JSON.stringify(tag), headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                fetchData();
                setIsOpenEditModal(false);
            } else {
                enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600'>
            <HeadingSmall marginTop='0' marginBottom='scale900'>标签列表</HeadingSmall>
            <Block display='flex' alignItems='center' justifyContent='space-between' marginBottom='scale900' overrides={{
                Block: {
                    style: {
                        [MOBILE_BREAKPOINT]: {
                            flexDirection: 'column', alignItems: 'flex-start',
                            justifyContent: 'flex-start', gap: theme.sizing.scale600,
                        }
                    }
                }
            }}>
                <Block display='flex' alignItems='center' gridGap='scale300' width='100%'>
                    <form className={css({ display: 'flex', alignItems: 'center', gap: theme.sizing.scale300, [MOBILE_BREAKPOINT]: { width: '100%' } })}
                        onSubmit={e => {
                            e.preventDefault();
                            fetchData();
                        }}>
                        <Block flex='1'><Input inputRef={keywordRef} value={keyword} size='compact' placeholder='输入名称进行搜索...' onChange={e => setKeyword(e.target.value)} clearOnEscape clearable /></Block>
                        <Block><Button kind='secondary' size='compact' type='submit'>搜索</Button></Block>
                    </form>
                </Block>

                <Block display='flex' alignItems='center' gridGap='scale300' alignSelf='flex-end'>
                    <Block><Button kind='secondary' size='mini' shape='circle' onClick={e => {
                        e.preventDefault();
                        setTag({ name: '', category: Tag.category.normal });
                        setIsOpenEditModal(true);
                    }}><Plus width={16} height={16} /></Button></Block>
                    <Block>
                        <StatefulPopover
                            focusLock
                            placement='bottomRight'
                            content={({ close }) => (
                                <StatefulMenu
                                    items={[
                                        { label: '自定义标签', checked: isNormal },
                                        { label: '游戏类型', checked: isGenre },
                                        { label: '游戏功能', checked: isFeature },
                                    ]}
                                    onItemSelect={({ item }) => {
                                        switch (item.label) {
                                            case '自定义标签': setIsNormal(prev => !prev); break;
                                            case '游戏类型': setIsGenre(prev => !prev); break;
                                            case '游戏功能': setIsFeature(prev => !prev); break;
                                            default: break;
                                        }
                                        close()
                                    }}
                                    overrides={{
                                        Option: {
                                            component: OptionList,
                                            props: {
                                                getItemLabel: item => {
                                                    return (
                                                        <Block display='flex' alignItems='center' gridGap='scale300'>
                                                            <LabelSmall>{item.label}</LabelSmall>
                                                            {item.checked && <Block display='flex'><Check width={16} /></Block>}
                                                        </Block>
                                                    );
                                                },
                                            }
                                        }
                                    }}
                                />
                            )}
                        >
                            <Button kind='secondary' size='mini' shape='circle' >
                                <Filter width={16} />
                            </Button>
                        </StatefulPopover>
                    </Block>
                    <Button size='mini' kind='secondary' shape='circle' isLoading={isLoading} disabled={!hasPrev}
                        onClick={() => setSkip(prev => prev - limit)}>
                        <ArrowLeft width={16} title='上一页' />
                    </Button>
                    <Button size='mini' kind='secondary' shape='circle' isLoading={isLoading} disabled={!hasNext}
                        onClick={() => setSkip(prev => prev + limit)}>
                        <ArrowRight width={16} title='下一页' />
                    </Button>
                </Block>
            </Block>
            {isLoading
                ? <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'><Spinner $size='scale1400' $borderWidth='scale200' /></Block>
                :
                <Block display='flex' flexDirection='column'>
                    <TableBuilder data={reviews} size='compact' emptyMessage='没有数据'
                        overrides={{
                            TableBodyCell: {
                                style: {
                                    verticalAlign: 'middle',
                                }
                            }
                        }}
                    >
                        <TableBuilderColumn header='ID'>
                            {row => <LabelSmall >{row.id}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='名称'>
                            {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='160px' maxWidth='160px' overflow='hidden'>{row.name}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='类型'>
                            {row => <LabelSmall>{Tag.category.getDisplayLabel(row.category)}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='创建于'>
                            {row => <LabelSmall whiteSpace='nowrap'>{dayjs(row.createdAt).format('YYYY-MM-DD HH:mm:ss')}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='操作'>
                            {(row) => (<Block display='flex' alignItems='center' gridGap='scale300'>
                                <Button kind='secondary' $as='a' href={`/tags/${row.name}`} target='_blank' size='mini' shape='circle'><Eye width={16} height={16} /></Button>
                                <Button kind='secondary' size='mini' shape='circle' onClick={e => {
                                    e.preventDefault();
                                    setTag({ id: row.id, name: row.name, category: row.category });
                                    setIsOpenEditModal(true);
                                }}><EditLine width={16} height={16} /></Button>
                                <Button kind='secondary' size='mini' shape='circle' onClick={() => {
                                    setSelectedId(row.id);
                                    setIsOpenDeleteConfirmModal(true);
                                }}><TrashBin width={16} height={16} /></Button>
                            </Block>)}
                        </TableBuilderColumn>
                    </TableBuilder>
                </Block>
            }
            <Modal onClose={() => setIsOpenDeleteConfirmModal(false)}
                closeable={false}
                isOpen={isOpenDeleteConfirmModal}
                animate
                autoFocus
                role={ROLE.alertdialog}
            >
                <ModalHeader>是否删除标签？</ModalHeader>
                <ModalBody>您确定要删除这个标签吗？所有游戏将不再拥有该标签。该操作<b>不能撤消</b>。</ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenDeleteConfirmModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleDelete()} isLoading={isLoading}>确定</ModalButton>
                </ModalFooter>
            </Modal>
            <Modal onClose={() => setIsOpenEditModal(false)}
                closeable={false}
                isOpen={isOpenEditModal}
                animate
                autoFocus
                role={ROLE.dialog}
            >
                <ModalHeader>{tag?.id ? '编辑' : '新增'}</ModalHeader>
                <ModalBody $as='div'>
                    <FormControl label={<LabelSmall>名称</LabelSmall>}>
                        <Input size='compact' error={!tag?.name || tag.name.length < 1} required value={tag?.name} onChange={e => setTag(prev => ({ ...prev, name: e.target.value }))} />
                    </FormControl>
                    <FormControl label={<LabelSmall>类别</LabelSmall>} caption={'功能/特性/标签'}>
                        <Select size='compact' clearable={false} placeholder='' options={Tag.category.options}
                            value={Tag.category.options.filter(o => o.id === tag?.category)} onChange={params => setTag(prev => ({ ...prev, category: params.value[0].id }))} />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenEditModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleSave()} isLoading={isLoading}>确定</ModalButton>
                </ModalFooter>
            </Modal>
        </Block>
    );
}

export default AdminPanelTags;