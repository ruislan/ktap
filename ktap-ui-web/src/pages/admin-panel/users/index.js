import React from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useStyletron } from 'baseui/styles';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import { HeadingSmall, LabelSmall, ParagraphXSmall } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { OptionList, StatefulMenu } from 'baseui/menu';
import { MOBILE_BREAKPOINT } from '../../../constants';
import { ArrowLeft, ArrowRight, Filter, Overflow, Check, Delete } from 'baseui/icon';
import { Eye, Rocket } from '../../../components/icons';
import { StatefulPopover } from 'baseui/popover';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';
import { FormControl } from 'baseui/form-control';

function AdminPanelUsers() {
    const limit = 10;
    const [css, theme] = useStyletron();
    const { enqueue } = useSnackbar();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const [data, setData] = React.useState(null);
    const [skip, setSkip] = React.useState(0);
    const [hasNext, setHasNext] = React.useState(false);
    const [hasPrev, setHasPrev] = React.useState(false);
    const [keyword, setKeyword] = React.useState('');
    const keywordRef = React.useRef(null);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [isLocked, setIsLocked] = React.useState(false);
    const [hasReviews, setHasReviews] = React.useState(false);
    const [hasComments, setHasComments] = React.useState(false);

    const [isOpenMonkeyModal, setIsOpenMonkeyModal] = React.useState(false);
    const [monkeyForm, setMonkeyForm] = React.useState({ count: 0 });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const fetchData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            let url = `/admin/users?keyword=${keywordRef.current.value || ''}&skip=${skip}&limit=${limit}`;
            if (isAdmin) url += `&isAdmin=${isAdmin}`;
            if (isLocked) url += `&isLocked=${isLocked}`;
            if (hasReviews) url += `&hasReviews=${hasReviews}`;
            if (hasComments) url += `&hasComments=${hasComments}`;
            const res = await fetch(url);
            if (res.ok) {
                const json = await res.json();
                setData(json.data);
                setHasNext(json.skip + json.limit < json.count);
                setHasPrev(json.skip + json.limit > json.limit);
            }
        } finally {
            setIsLoading(false);
        }
    }, [skip, isAdmin, isLocked, hasReviews, hasComments]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmitMonkey = async () => {
        if (monkeyForm.count < 1) return;
        try {
            setIsSubmitting(true);
            const res = await fetch(`/admin/users/monkey`, {
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
        <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600'>
            <HeadingSmall marginTop='0' marginBottom='scale900'>用户列表</HeadingSmall>
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
                        <Block flex='1'><Input inputRef={keywordRef} value={keyword} size='compact' placeholder='输入内容进行搜索...' onChange={e => setKeyword(e.target.value)} clearOnEscape clearable /></Block>
                        <Block><Button kind='secondary' size='compact' type='submit'>搜索</Button></Block>
                    </form>
                </Block>
                <Block display='flex' alignItems='center' gridGap='scale300' alignSelf='flex-end'>
                    <Button size='mini' kind='secondary' shape='circle'
                        onClick={e => {
                            e.preventDefault();
                            setIsOpenMonkeyModal(true);
                        }}>
                        <Rocket width={16} title='用户乱入' />
                    </Button>
                    <Block>
                        <StatefulPopover
                            focusLock
                            placement='bottomRight'
                            content={({ close }) => (
                                <StatefulMenu
                                    items={[
                                        { label: '是管理员', checked: isAdmin },
                                        { label: '被锁定', checked: isLocked },
                                        { label: '有评测', checked: hasReviews },
                                        { label: '有回复', checked: hasComments },
                                    ]}
                                    onItemSelect={({ item }) => {
                                        switch (item.label) {
                                            case '是管理员': setIsAdmin(prev => !prev); break;
                                            case '被锁定': setIsLocked(prev => !prev); break;
                                            case '有评测': setHasReviews(prev => !prev); break;
                                            case '有回复': setHasComments(prev => !prev); break;
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
                            <Button kind='secondary' size='mini' shape='circle' title='过滤'>
                                <Filter width={16} title='过滤' />
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

            <Block display='flex' justifyContent='flex-start'>
                {isLoading
                    ? <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'><Spinner $size='scale1600' $borderWidth='scale200' /></Block>
                    : (data &&
                        <Block display='flex' flexDirection='column' width='100%'>
                            <TableBuilder data={data} size='compact' emptyMessage='没有数据'
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
                                <TableBuilderColumn header='名称'>
                                    {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='160px' maxWidth='160px' overflow='hidden'>{row?.name}</LabelSmall>}
                                </TableBuilderColumn>
                                <TableBuilderColumn header='管理员'>
                                    {row => <LabelSmall>{row?.isAdmin ? '是' : '否'}</LabelSmall>}
                                </TableBuilderColumn>
                                <TableBuilderColumn header='锁定'>
                                    {row => <LabelSmall>{row?.isLocked ? '是' : '否'}</LabelSmall>}
                                </TableBuilderColumn>
                                <TableBuilderColumn header='创建于'>
                                    {row => <LabelSmall whiteSpace='nowrap'>{dayjs(row?.createdAt).format('YYYY-MM-DD HH:mm:ss')}</LabelSmall>}
                                </TableBuilderColumn>
                                <TableBuilderColumn header='操作'>
                                    {(row) => (<Block display='flex' alignItems='center' gridGap='scale300'>
                                        <Button kind='secondary' $as='a' href={`/users/${row.id}`} target='_blank' size='mini' shape='circle'><Eye width={16} height={16} /></Button>
                                        <Button kind='secondary' onClick={() => navigate(`/admin-panel/users/${row.id}`)} size='mini' shape='circle'><Overflow width={16} height={16} /></Button>
                                    </Block>)}
                                </TableBuilderColumn>
                            </TableBuilder>
                        </Block>
                    )
                }
            </Block>
            <Modal onClose={() => setIsOpenMonkeyModal(false)}
                closeable={false}
                isOpen={isOpenMonkeyModal}
                animate
                autoFocus
                role={ROLE.dialog}
            >
                <ModalHeader>用户乱入</ModalHeader>
                <ModalBody $as='div'>
                    <ParagraphXSmall marginTop='0' marginBottom='0'>慎用！此乱入将会生成所选数量的普通用户。如在生产环境中，可能影响正常运营。</ParagraphXSmall>
                    <ParagraphXSmall marginTop='0' marginBottom='0'>用户将会随机取英文，邮箱将会是“m[时间][数字]@ktap.com”。</ParagraphXSmall>
                    <ParagraphXSmall marginTop='0'>默认密码为“123456”。</ParagraphXSmall>
                    <FormControl label={<LabelSmall>数量</LabelSmall>} caption='数量越大，时间越久'>
                        <Input size='compact' required type='number' min={1} value={monkeyForm.count} onChange={e => setMonkeyForm({ ...monkeyForm, count: e.target.value })} />
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

export default AdminPanelUsers;