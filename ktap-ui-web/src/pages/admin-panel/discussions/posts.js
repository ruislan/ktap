import React from 'react';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Input, StatefulInput } from 'baseui/input';
import { StatefulPopover } from 'baseui/popover';
import { HeadingSmall, LabelSmall, LabelXSmall, ParagraphXSmall } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { Eye, Rocket, TrashBin } from '../../../components/icons';
import { ArrowLeft, ArrowRight, Check, Filter, Delete } from 'baseui/icon';
import { useStyletron } from 'baseui/styles';
import { OptionList, StatefulMenu } from 'baseui/menu';
import { DateTime, MOBILE_BREAKPOINT, PAGE_LIMIT_MINI, PAGE_LIMIT_SMALL } from '../../../constants';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';
import { Hand } from '../../../components/icons';
import AvatarSquare from '../../../components/avatar-square';
import { FormControl } from 'baseui/form-control';
import { Textarea } from 'baseui/textarea';
import { Checkbox } from 'baseui/checkbox';

function ReportsBlock({ postId }) {
    const limit = PAGE_LIMIT_MINI;
    const [reports, setReports] = React.useState([]);
    const [hasMore, setHasMore] = React.useState(false);
    const [skip, setSkip] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/admin/discussion-posts/${postId}/reports?skip=${skip}&limit=${limit}`);
                if (res.ok) {
                    const json = await res.json();
                    setReports(json.data);
                    setHasMore(json.skip + json.limit < json.count);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [postId, limit, skip]);

    return (
        <Block display='flex' flexDirection='column' marginTop='scale600' padding='scale300' gridGap='scale300' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    borderRadius: $theme.borders.radius300,
                    border: '1px solid ' + $theme.borders.border600.borderColor,
                })
            }
        }}>
            {reports && reports.map((report) => (
                <Block display='flex' gridGap='scale600'>
                    <Block><AvatarSquare src={report.user?.avatar} size='scale1200' /></Block>
                    <Block display='flex' flexDirection='column' gridGap='scale100'>
                        <LabelXSmall>{report.user?.name}</LabelXSmall>
                        <ParagraphXSmall marginTop='0' marginBottom='0'>{report.content}</ParagraphXSmall>
                        <LabelXSmall color='primary400'>{DateTime.format(report.createdAt)}</LabelXSmall>
                    </Block>
                </Block>
            ))}
            {hasMore && (
                <Block marginTop='scale600' display='flex' justifyContent='center' alignItems='center'>
                    <Button size='compact' onClick={() => setSkip(prev => prev + limit)} kind='tertiary' isLoading={isLoading}>
                        查看更多
                    </Button>
                </Block>
            )}
        </Block>
    );
}

function AdminPanelPosts() {
    const limit = PAGE_LIMIT_SMALL;
    const { enqueue } = useSnackbar();
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(true);
    const [reviews, setReviews] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [total, setTotal] = React.useState(0);
    const pageInputRef = React.useRef(null);
    const [hasNext, setHasNext] = React.useState(false);
    const [hasPrev, setHasPrev] = React.useState(false);
    const [keyword, setKeyword] = React.useState('');
    const keywordRef = React.useRef(null);
    const [isReported, setIsReported] = React.useState(false);
    const [hasGifts, setHasGifts] = React.useState(false);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState(null);
    const [isOpenReportsModal, setIsOpenReportsModal] = React.useState(false);
    const [isOpenMonkeyModal, setIsOpenMonkeyModal] = React.useState(false);
    const initMonkeyForm = { isAll: false, content: '', discussionCount: 1, userId: 1, };
    const [monkeyForm, setMonkeyForm] = React.useState(initMonkeyForm);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/discussion-posts?keyword=${keywordRef.current.value || ''}&isReported=${isReported}&hasGifts=${hasGifts}&skip=${skip}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                setReviews(json.data);
                setTotal(json.count);
                setHasNext(json.skip + json.limit < json.count);
                setHasPrev(json.skip + json.limit > json.limit);
            }
        } finally {
            setIsLoading(false);
        }
    }, [skip, limit, isReported, hasGifts]);

    const handleDelete = async () => {
        if (!selectedRow?.id) return;
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/discussion-posts/${selectedRow.id}`, { method: 'DELETE' });
            if (res.ok) {
                enqueue({ message: '删除成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                fetchData();
            } else {
                enqueue({ message: '删除失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsLoading(false);
            setIsOpenDeleteConfirmModal(false);
        }
    };

    const handleSubmitMonkey = async () => {
        try {
            setIsSubmitting(true);
            const res = await fetch(`/admin/discussion-posts/monkey`, {
                method: 'POST',
                body: JSON.stringify({ ...monkeyForm }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                enqueue({ message: '操作完成', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
                setIsOpenMonkeyModal(false);
                setMonkeyForm(initMonkeyForm);
                fetchData();
            } else {
                enqueue({ message: '操作失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);
    return (
        <Block display='flex' flexDirection='column'>
            <HeadingSmall marginTop='0' marginBottom='scale900'>回帖列表</HeadingSmall>
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
                    <Block>
                        <Button kind='secondary' size='mini' shape='circle' onClick={e => {
                            e.preventDefault();
                            setIsOpenMonkeyModal(true);
                        }}><Rocket width={16} height={16} /></Button>
                    </Block>
                    <Block>
                        <StatefulPopover
                            focusLock
                            placement='bottomRight'
                            content={({ close }) => (
                                <StatefulMenu
                                    items={[
                                        { label: '有举报', checked: isReported },
                                        { label: '有礼物', checked: hasGifts },
                                    ]}
                                    onItemSelect={({ item }) => {
                                        switch (item.label) {
                                            case '有举报': setIsReported(prev => !prev); break;
                                            case '有礼物': setHasGifts(prev => !prev); break;
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
                        <TableBuilderColumn header='内容'>
                            {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' maxWidth='160px' overflow='hidden'>{row.content}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='发布者'>
                            {row => <LabelSmall>{row.user?.name}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='所属讨论'>
                            {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' maxWidth='100px' overflow='hidden'>{row.discussion?.title}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='创建于'>
                            {row => <LabelSmall whiteSpace='nowrap'>{DateTime.format(row.createdAt)}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='操作'>
                            {(row) => (<Block display='flex' alignItems='center' gridGap='scale300'>
                                <Button kind='secondary' $as='a' href={`/discussions/${row.discussion?.id}`} target='_blank' size='mini' shape='circle'><Eye width={16} height={16} /></Button>
                                <Button kind='secondary' disabled={!row.meta?.reports || row.meta.reports <= 0} size='mini' shape='circle' onClick={() => {
                                    setSelectedRow(row);
                                    setIsOpenReportsModal(true);
                                }}><Hand width={16} height={16} /></Button>
                                <Button kind='secondary' size='mini' shape='circle' onClick={() => {
                                    setSelectedRow(row);
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
                <ModalHeader>是否删除回帖？</ModalHeader>
                <ModalBody>您确定要删除这篇回帖吗？回帖相关的礼物、赞踩等将会全部删除。该操作<b>不能撤消</b>。</ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenDeleteConfirmModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleDelete()} isLoading={isLoading}>确定</ModalButton>
                </ModalFooter>
            </Modal>

            <Modal onClose={() => setIsOpenReportsModal(false)}
                closeable={false}
                isOpen={isOpenReportsModal}
                animate
                autoFocus
                role={ROLE.dialog}
            >
                <ModalHeader>举报列表</ModalHeader>
                <ModalBody $as='div'>
                    <ReportsBlock postId={selectedRow?.id} />
                </ModalBody>
                <ModalFooter>
                    <ModalButton onClick={() => setIsOpenReportsModal(false)}>关闭</ModalButton>
                </ModalFooter>
            </Modal>

            <Modal onClose={() => setIsOpenMonkeyModal(false)}
                closeable={false}
                isOpen={isOpenMonkeyModal}
                animate
                autoFocus
                role={ROLE.dialog}
            >
                <ModalHeader>回帖乱入</ModalHeader>
                <ModalBody $as='div'>
                    <ParagraphXSmall marginTop='0'>慎用！此乱入将会使用<strong>一个用户</strong>对<strong>所选数量的游戏</strong>的<strong>第一个频道</strong>进行讨论。</ParagraphXSmall>
                    <FormControl label={<LabelSmall>用户ID</LabelSmall>}>
                        <Input size='compact' required type='number' min={1} value={monkeyForm.userId} onChange={e => setMonkeyForm({ ...monkeyForm, userId: e.target.value })} />
                    </FormControl>
                    <FormControl label={<LabelSmall>内容</LabelSmall>} caption={'前端支持html标签有:h1,h2,h3,img,strong,em,u,s,blockquote,span。'}>
                        <Textarea size='compact' rows={8} required value={monkeyForm.content} onChange={e => setMonkeyForm(prev => ({ ...prev, content: e.target.value }))} />
                    </FormControl>
                    <FormControl label={<LabelSmall>讨论数量</LabelSmall>} caption='会对最近的所选数量的讨论回帖'>
                        <Input size='compact' type='number' min={1} disabled={monkeyForm.isAll} value={monkeyForm.discussionCount}
                            onChange={e => setMonkeyForm({ ...monkeyForm, discussionCount: e.target.value })}
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

export default AdminPanelPosts;