import React from 'react';

import { useStyletron } from 'baseui/styles';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Input, StatefulInput } from 'baseui/input';
import { HeadingSmall, LabelSmall, } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';
import { FormControl } from 'baseui/form-control';
import { StatefulPopover } from 'baseui/popover';
import { ArrowLeft, ArrowRight, Plus, Check, Delete } from 'baseui/icon';
import { StyledLink } from 'baseui/link';

import { EditLine, TrashBin, ExternalLink } from '@ktap/components/icons';
import { DateTime, MOBILE_BREAKPOINT, PAGE_LIMIT_SMALL } from '@ktap/libs/utils';

function AdminPanelGifts() {
    const limit = PAGE_LIMIT_SMALL;
    const { enqueue } = useSnackbar();
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(true);
    const [gifts, setGifts] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [total, setTotal] = React.useState(0);
    const pageInputRef = React.useRef(null);
    const [hasNext, setHasNext] = React.useState(false);
    const [hasPrev, setHasPrev] = React.useState(false);
    const [keyword, setKeyword] = React.useState('');
    const keywordRef = React.useRef(null);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState(null);

    const [isOpenEditModal, setIsOpenEditModal] = React.useState(false);
    const [gift, setGift] = React.useState({});

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/gifts?keyword=${keywordRef.current.value || ''}&skip=${skip}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                setGifts(json.data);
                setTotal(json.count);
                setHasNext(json.skip + json.limit < json.count);
                setHasPrev(json.skip + json.limit > json.limit);
            }
        } finally {
            setIsLoading(false);
        }
    }, [skip, limit]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/gifts/${selectedId}`, { method: 'DELETE' });
            if (res.ok) {
                enqueue({ message: '删除成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                fetchData();
            } else if (res.status === 412) {
                enqueue({ message: '删除失败，该礼物已经被赠送过，不允许删除', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            } else {
                enqueue({ message: '删除失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsOpenDeleteConfirmModal(false);
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const url = gift.id ? `/admin/gifts/${gift.id}` : '/admin/gifts';
            const method = gift.id ? 'PUT' : 'POST';
            const res = await fetch(url, { method, body: JSON.stringify(gift), headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
                enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                fetchData();
            } else {
                enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsOpenEditModal(false);
            setIsLoading(false);
        }
    };

    return (
        <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600'>
            <HeadingSmall marginTop='0' marginBottom='scale900'>流行语列表</HeadingSmall>
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
                            skip === 0 ? fetchData() : setSkip(0);
                        }}>
                        <Block flex='1'><Input inputRef={keywordRef} value={keyword} size='compact' placeholder='搜索标题/概括/内容...' onChange={e => setKeyword(e.target.value)} clearOnEscape clearable /></Block>
                        <Block><Button kind='secondary' size='compact' type='submit'>搜索</Button></Block>
                    </form>
                </Block>

                <Block display='flex' alignItems='center' gridGap='scale300' alignSelf='flex-end'>
                    <Button kind='secondary' size='mini' shape='circle' onClick={e => {
                        e.preventDefault();
                        setGift({ name: '', description: '', price: 0, url: '' });
                        setIsOpenEditModal(true);
                    }}><Plus width={16} height={16} /></Button>
                    <Button size='mini' kind='secondary' shape='circle' isLoading={isLoading} disabled={!hasPrev}
                        onClick={() => setSkip(prev => prev - limit)}>
                        <ArrowLeft width={16} title='上一页' />
                    </Button>
                    <Button size='mini' kind='secondary' shape='circle' isLoading={isLoading} disabled={!hasNext}
                        onClick={() => setSkip(prev => prev + limit)}>
                        <ArrowRight width={16} title='下一页' />
                    </Button>
                    <Block display='flex' whiteSpace='nowrap'>
                        <StatefulPopover focusLock placement='left'
                            content={({ close }) => (
                                <Block display='flex' whiteSpace='nowrap' gridGap='scale0'>
                                    <StatefulInput type='number' inputRef={pageInputRef} min={1} max={Math.ceil(total / limit)} size='mini' initialState={{ value: skip / limit + 1 }} placeholder='页码' />
                                    <Button size='mini' kind='default' onClick={e => {
                                        e.preventDefault();
                                        const page = Math.min(parseInt(pageInputRef.current.value), Math.ceil(total / limit));
                                        setSkip((page - 1) * limit);
                                        close();
                                    }}>跳转</Button>
                                </Block>
                            )}
                        >
                            <Button size='mini' kind='secondary' isLoading={isLoading} shape='pill'
                                onClick={() => setSkip(prev => prev - limit)}>
                                {Math.ceil(skip / limit) + 1} / {Math.ceil(total / limit)}
                            </Button>
                        </StatefulPopover>
                    </Block>
                </Block>
            </Block>
            {isLoading
                ? <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'>
                    <Spinner $size='scale1600' $borderWidth='scale300' $color='primary' />
                </Block>
                :
                <Block display='flex' flexDirection='column'>
                    <TableBuilder data={gifts} size='compact' emptyMessage='没有数据'
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
                            {row => <LabelSmall>{row.name}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='说明'>
                            {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='160px' maxWidth='160px' overflow='hidden'>{row.description}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='价格'>
                            {row => <LabelSmall>{row.price}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='图片'>
                            {row =>
                                <Block display='flex' alignItems='center' gridGap='scale300'>
                                    <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='160px' maxWidth='160px' overflow='hidden'>{row.url}</LabelSmall>
                                    <Block display='flex'><StyledLink href={row.url} target='_blank'><ExternalLink width={16} /></StyledLink></Block>
                                </Block>
                            }
                        </TableBuilderColumn>
                        <TableBuilderColumn header='创建于'>
                            {row => <LabelSmall whiteSpace='nowrap'>{DateTime.format(row.createdAt)}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='操作'>
                            {(row) => (
                                <Block display='flex' alignItems='center' gridGap='scale300'>
                                    <Button kind='secondary' size='mini' shape='circle' onClick={() => {
                                        setGift({ id: row.id, name: row.name, description: row.description, price: row.price, url: row.url });
                                        setIsOpenEditModal(true);
                                    }}><EditLine width={16} height={16} /></Button>
                                    <Button kind='secondary' size='mini' shape='circle' onClick={() => {
                                        setSelectedId(row?.id);
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
                <ModalHeader>是否删除礼物？</ModalHeader>
                <ModalBody>您确定要删除这个礼物吗？已经被赠送过的礼物将删除失败。该操作<b>不能撤消</b>。</ModalBody>
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
                <ModalHeader>{gift.id ? '编辑' : '新增'}</ModalHeader>
                <ModalBody>
                    <FormControl label={<LabelSmall>名称</LabelSmall>}>
                        <Input size='compact' value={gift.name} onChange={e => setGift({ ...gift, name: e.target.value })} />
                    </FormControl>
                    <FormControl label={<LabelSmall>说明</LabelSmall>}>
                        <Input size='compact' value={gift.description} onChange={e => setGift({ ...gift, description: e.target.value })} />
                    </FormControl>
                    <FormControl label={<LabelSmall>价格</LabelSmall>}>
                        <Input size='compact' type='number' step={1} value={gift.price} onChange={e => setGift({ ...gift, price: e.target.value })} />
                    </FormControl>
                    <FormControl label={<LabelSmall>图片</LabelSmall>}>
                        <Input size='compact' value={gift.url} onChange={e => setGift({ ...gift, url: e.target.value })} />
                    </FormControl>
                    <Block marginTop='scale300'>
                        <img src={gift.url} style={{ width: '128px' }} />
                    </Block>
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenEditModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleSave()} isLoading={isLoading}>确定</ModalButton>
                </ModalFooter>
            </Modal>
        </Block>
    );
}

export default AdminPanelGifts;