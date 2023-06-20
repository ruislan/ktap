import React from 'react';
import dayjs from 'dayjs';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Input, StatefulInput } from 'baseui/input';
import { StatefulPopover } from 'baseui/popover';
import { HeadingSmall, LabelSmall } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { Textarea } from 'baseui/textarea';
import { EditLine, Eye, TrashBin } from '../../../components/icons';
import { ArrowLeft, ArrowRight, Plus, Check, Delete } from 'baseui/icon';
import { useStyletron } from 'baseui/styles';
import { MOBILE_BREAKPOINT } from '../../../constants';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';
import { FormControl } from 'baseui/form-control';

function AdminPanelNews() {
    const limit = 10;
    const { enqueue } = useSnackbar();
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(true);
    const [newsList, setNewsList] = React.useState([]);
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
    const [news, setNews] = React.useState(null);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/news?keyword=${keywordRef.current.value || ''}&skip=${skip}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                setNewsList(json.data);
                setTotal(json.count);
                setHasNext(json.skip + json.limit < json.count);
                setHasPrev(json.skip + json.limit > json.limit);
            }
        } finally {
            setIsLoading(false);
        }
    }, [skip]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/news/${selectedId}`, { method: 'DELETE' });
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
        try {
            setIsLoading(true);
            const url = news.id ? `/admin/news/${news.id}` : '/admin/news';
            const method = news.id ? 'PUT' : 'POST';
            const res = await fetch(url, { method, body: JSON.stringify(news), headers: { 'Content-Type': 'application/json' } });
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
    }

    return (
        <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600'>
            <HeadingSmall marginTop='0' marginBottom='scale900'>新闻列表</HeadingSmall>
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
                        setNews({ title: '', summary: '', head: '', banner: '', content: '', appId: '' });
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
                ? <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'><Spinner $size='scale1400' $borderWidth='scale200' /></Block>
                :
                <Block display='flex' flexDirection='column'>
                    <TableBuilder data={newsList} size='compact' emptyMessage='没有数据'
                        overrides={{
                            TableBodyCell: {
                                style: {
                                    verticalAlign: 'middle',
                                }
                            }
                        }}
                    >
                        <TableBuilderColumn header='ID'>
                            {row => <LabelSmall >{row?.id}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='标题'>
                            {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='160px' maxWidth='160px' overflow='hidden'>{row?.title}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='游戏'>
                            {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='160px' maxWidth='160px' overflow='hidden'>{row?.app?.name}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='创建于'>
                            {row => <LabelSmall whiteSpace='nowrap'>{dayjs(row?.createdAt).format('YYYY-MM-DD HH:mm:ss')}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='操作'>
                            {(row) => (<Block display='flex' alignItems='center' gridGap='scale300'>
                                <Button kind='secondary' $as='a' href={`/news/${row.id}`} target='_blank' size='mini' shape='circle'><Eye width={16} height={16} /></Button>
                                <Button kind='secondary' size='mini' shape='circle' onClick={e => {
                                    e.preventDefault();
                                    setNews({ id: row.id, title: row.title, summary: row.summary, head: row.head, banner: row.banner, content: row.content, appId: row.app.id });
                                    setIsOpenEditModal(true);
                                }}><EditLine width={16} height={16} /></Button>
                                <Button kind='secondary' size='mini' shape='circle' onClick={e => {
                                    e.preventDefault();
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
                <ModalHeader>是否删除回复？</ModalHeader>
                <ModalBody>您确定要删除这篇回复吗？该操作<b>不能撤消</b>。</ModalBody>
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
                <ModalHeader>{news?.id ? '编辑' : '新增'}</ModalHeader>
                <ModalBody $as='div'>
                    <FormControl label={<LabelSmall>标题</LabelSmall>}>
                        <Input size='compact' required value={news?.title} onChange={e => setNews(prev => ({ ...prev, title: e.target.value }))} />
                    </FormControl>
                    <FormControl label={<LabelSmall>概述</LabelSmall>}>
                        <Input size='compact' required value={news?.summary} onChange={e => setNews(prev => ({ ...prev, summary: e.target.value }))} />
                    </FormControl>
                    <FormControl label={<LabelSmall>内容</LabelSmall>} caption={'支持html标签'}>
                        <Textarea size='compact' rows={8} required value={news?.content} onChange={e => setNews(prev => ({ ...prev, content: e.target.value }))} />
                    </FormControl>
                    <FormControl label={<LabelSmall>所属游戏ID</LabelSmall>}>
                        <Input size='compact' type='number' step={1} min={1} required value={news?.appId} onChange={e => setNews(prev => ({ ...prev, appId: e.target.value }))} />
                    </FormControl>
                    <FormControl label={<LabelSmall>配图</LabelSmall>} caption={'用于列表展示'}>
                        <Input size='compact' required value={news?.head} onChange={e => setNews(prev => ({ ...prev, head: e.target.value }))} />
                    </FormControl>
                    {news?.head && <Block maxWidth='160px' maxHeight='100px'><img src={news?.head} width='100%' height='100%' /></Block>}
                    <FormControl label={<LabelSmall>横幅</LabelSmall>} caption={'用于详情头部背景（非必需）'}>
                        <Input size='compact' required value={news?.banner} onChange={e => setNews(prev => ({ ...prev, banner: e.target.value }))} />
                    </FormControl>
                    {news?.banner && <Block maxWidth='100%'><img src={news?.banner} width='100%' height='100%' /></Block>}
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenEditModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleSave()} isLoading={isLoading}>确定</ModalButton>
                </ModalFooter>
            </Modal>
        </Block>
    );
}

export default AdminPanelNews;