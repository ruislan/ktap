import React from 'react';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Input, StatefulInput } from 'baseui/input';
import { StatefulPopover } from 'baseui/popover';
import { FormControl } from 'baseui/form-control';
import { Checkbox } from 'baseui/checkbox';
import { HeadingSmall, LabelSmall, LabelXSmall, ParagraphXSmall } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { Eye, Rocket, TrashBin } from '../../../components/icons';
import { ArrowLeft, ArrowRight, Check, Delete } from 'baseui/icon';
import { useStyletron } from 'baseui/styles';
import { DateTime, MOBILE_BREAKPOINT, PAGE_LIMIT_SMALL } from '../../../constants';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';

function AdminPanelReviewComments() {
    const limit = PAGE_LIMIT_SMALL;
    const { enqueue } = useSnackbar();
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(true);
    const [comments, setComments] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [total, setTotal] = React.useState(0);
    const pageInputRef = React.useRef(null);
    const [hasNext, setHasNext] = React.useState(false);
    const [hasPrev, setHasPrev] = React.useState(false);
    const [keyword, setKeyword] = React.useState('');
    const keywordRef = React.useRef(null);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState(null);

    const [isOpenMonkeyModal, setIsOpenMonkeyModal] = React.useState(false);
    const [monkeyForm, setMonkeyForm] = React.useState({ isAll: false, reviewCount: 0, commentCount: 0, userId: 1 });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/review-comments?keyword=${keywordRef.current.value || ''}&skip=${skip}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                setComments(json.data);
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
        if (!selectedId) return;
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/review-comments/${selectedId}`, { method: 'DELETE' });
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

    const handleSubmitMonkey = async () => {
        if (monkeyForm.commentCount < 1 || (monkeyForm.reviewCount < 1 && !monkeyForm.isAll)) return;
        try {
            setIsSubmitting(true);
            const res = await fetch(`/admin/review-comments/monkey`, {
                method: 'POST',
                body: JSON.stringify({ ...monkeyForm }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                enqueue({ message: '操作完成', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                setIsOpenMonkeyModal(false);
                setMonkeyForm({ ...monkeyForm, reviewCount: 0, commentCount: 0, isAll: false });
                fetchData();
            } else {
                enqueue({ message: '操作失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Block display='flex' flexDirection='column'>
            <HeadingSmall marginTop='0' marginBottom='scale900'>回复列表</HeadingSmall>
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
                        <Block flex='1'><Input inputRef={keywordRef} value={keyword} size='compact' placeholder='输入内容进行搜索...' onChange={e => setKeyword(e.target.value)} clearOnEscape clearable /></Block>
                        <Block><Button kind='secondary' size='compact' type='submit'>搜索</Button></Block>
                    </form>
                </Block>

                <Block display='flex' alignItems='center' gridGap='scale300' alignSelf='flex-end'>
                    <Button kind='secondary' size='mini' shape='circle' onClick={e => {
                        e.preventDefault();
                        setIsOpenMonkeyModal(true);
                    }}><Rocket width={16} height={16} /></Button>
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
                    <TableBuilder data={comments} size='compact' emptyMessage='没有数据'
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
                        <TableBuilderColumn header='内容'>
                            {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='160px' maxWidth='160px' overflow='hidden'>{row?.content}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='发布者'>
                            {row => <LabelSmall>{row?.user?.name}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='评测ID'>
                            {row => <LabelSmall>{row?.reviewId}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='创建于'>
                            {row => <LabelSmall whiteSpace='nowrap'>{DateTime.format(row?.createdAt)}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='操作'>
                            {(row) => (<Block display='flex' alignItems='center' gridGap='scale300'>
                                <Button kind='secondary' $as='a' href={`/reviews/${row.reviewId}`} target='_blank' size='mini' shape='circle'><Eye width={16} height={16} /></Button>
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
                <ModalHeader>是否删除回复？</ModalHeader>
                <ModalBody>您确定要删除这篇回复吗？该操作<b>不能撤消</b>。</ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenDeleteConfirmModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleDelete()} isLoading={isLoading}>确定</ModalButton>
                </ModalFooter>
            </Modal>

            <Modal onClose={() => setIsOpenMonkeyModal(false)}
                closeable={false}
                isOpen={isOpenMonkeyModal}
                animate
                autoFocus
                role={ROLE.dialog}
            >
                <ModalHeader>评论乱入</ModalHeader>
                <ModalBody $as='div'>
                    <ParagraphXSmall marginTop='0'>慎用！此乱入将会使用一个用户对所选数量的评测进行随机流行词回复。</ParagraphXSmall>
                    <FormControl label={<LabelSmall>用户ID</LabelSmall>}>
                        <Input size='compact' required type='number' min={1} value={monkeyForm.userId} onChange={e => setMonkeyForm({ ...monkeyForm, userId: e.target.value })} />
                    </FormControl>
                    <FormControl label={<LabelSmall>回复数量</LabelSmall>} caption='数量越大，时间越久'>
                        <Input size='compact' type='number' min={1} value={monkeyForm.commentCount} onChange={e => setMonkeyForm({ ...monkeyForm, commentCount: e.target.value })} />
                    </FormControl>
                    <FormControl label={<LabelSmall>评测数量</LabelSmall>} caption='会对最近的所选数量的评测进行回复'>
                        <Input size='compact' type='number' min={1} disabled={monkeyForm.isAll} value={monkeyForm.reviewCount}
                            onChange={e => setMonkeyForm({ ...monkeyForm, reviewCount: e.target.value })}
                            endEnhancer={() =>
                                <Block display='flex' alignItems='center' gridGap='scale100'>
                                    <Checkbox checked={monkeyForm.isAll} onChange={e => setMonkeyForm({ ...monkeyForm, isAll: e.target.checked })} />
                                    <LabelXSmall whiteSpace='nowrap'>全部</LabelXSmall>
                                </Block>
                            }
                        />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenMonkeyModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleSubmitMonkey()} isLoading={isSubmitting}>Let's roll</ModalButton>
                </ModalFooter>
            </Modal>
        </Block>
    );
}

export default AdminPanelReviewComments;