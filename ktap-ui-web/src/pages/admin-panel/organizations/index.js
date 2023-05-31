import React from 'react';
import dayjs from 'dayjs';
import { useStyletron } from 'baseui/styles';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import { Select } from "baseui/select";
import { HeadingSmall, LabelSmall, LabelXSmall } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';
import { FormControl } from 'baseui/form-control';
import { EditLine, Eye, TrashBin } from '../../../components/icons';
import { ArrowLeft, ArrowRight, Plus, Check, Delete } from 'baseui/icon';
import { MOBILE_BREAKPOINT, Organization } from '../../../constants';

function AdminPanelOrganizations() {
    const limit = 10;
    const { enqueue } = useSnackbar();
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(true);
    const [data, setData] = React.useState([]);
    const [skip, setSkip] = React.useState(0);
    const [hasNext, setHasNext] = React.useState(false);
    const [hasPrev, setHasPrev] = React.useState(false);
    const [keyword, setKeyword] = React.useState('');
    const keywordRef = React.useRef(null);
    const [isOpenDeleteConfirmModal, setIsOpenDeleteConfirmModal] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState(null);
    const [isOpenEditModal, setIsOpenEditModal] = React.useState(false);
    const [organization, setOrganization] = React.useState(null);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/organizations?keyword=${keywordRef.current.value || ''}&skip=${skip}&limit=${limit}`);
            if (res.ok) {
                const json = await res.json();
                setData(json.data);
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
        if (!selectedId) return;
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/organizations/${selectedId}`, { method: 'DELETE' });
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
        if (!organization.name || !organization.type) return;
        try {
            setIsLoading(true);
            const url = organization.id ? `/admin/organizations/${organization.id}` : '/admin/organizations';
            const method = organization.id ? 'PUT' : 'POST';
            const res = await fetch(url, { method, body: JSON.stringify(organization), headers: { 'Content-Type': 'application/json' } });
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
            <HeadingSmall marginTop='0' marginBottom='scale900'>组织列表</HeadingSmall>
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
                    <Block><Button kind='secondary' size='mini' shape='circle' onClick={e => {
                        e.preventDefault();
                        setOrganization({ name: '', type: Organization.type.individual, summary: '', logo: '', site: '', country: '', userId: '' });
                        setIsOpenEditModal(true);
                    }}><Plus width={16} height={16} /></Button></Block>
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
                            {row => <LabelSmall >{row.id}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='名称'>
                            {row => <LabelSmall whiteSpace='nowrap' textOverflow='ellipsis' width='160px' maxWidth='160px' overflow='hidden'>{row.name}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='所属人'>
                            {row => <LabelSmall>{row.user?.name}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='类型'>
                            {row => <LabelSmall whiteSpace='nowrap'>{Organization.type.getDisplayLabel(row.type)}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='开发'>
                            {row => <LabelSmall>{row.meta?.developed}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='发行'>
                            {row => <LabelSmall>{row.meta?.published}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='创建于'>
                            {row => <LabelSmall whiteSpace='nowrap'>{dayjs(row.createdAt).format('YYYY-MM-DD HH:mm:ss')}</LabelSmall>}
                        </TableBuilderColumn>
                        <TableBuilderColumn header='操作'>
                            {(row) => (<Block display='flex' alignItems='center' gridGap='scale300'>
                                <Button kind='secondary' $as='a' href={`/organizations/${row.id}`} target='_blank' size='mini' shape='circle'><Eye width={16} height={16} /></Button>
                                <Button kind='secondary' size='mini' shape='circle' onClick={e => {
                                    e.preventDefault();
                                    setOrganization({ id: row.id, name: row.name, summary: row.summary, logo: row.logo, site: row.site, type: row.type, country: row.country, userId: row.userId });
                                    setIsOpenEditModal(true);
                                }}><EditLine width={16} height={16} /></Button>
                                <Button kind='secondary' size='mini' shape='circle' disabled={(row.meta?.developed || 0 + row.meta?.published || 0) > 0} onClick={() => {
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
                <ModalHeader>是否删除组织？</ModalHeader>
                <ModalBody>您确定要删除这个组织吗？在删除该组织之前，你需要手动删除该组织发行或者研发的所有游戏，否则无法继续操作。如果确认删除，该操作<b>不能撤消</b>。</ModalBody>
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
                <ModalHeader>{organization?.id ? '编辑' : '新增'}</ModalHeader>
                <ModalBody $as='div'>
                    <FormControl label={<LabelSmall>名称</LabelSmall>}>
                        <Input size='compact' required value={organization?.name || ''} onChange={e => setOrganization(prev => ({ ...prev, name: e.target.value }))} />
                    </FormControl>
                    <FormControl label={<LabelSmall>类型</LabelSmall>} caption={'个人/工作室/公司'}>
                        <Select size='compact' clearable={false} placeholder='' options={Organization.type.options}
                            value={Organization.type.options.filter(o => o.id === organization?.type)} onChange={params => setOrganization(prev => ({ ...prev, type: params.value[0].id }))} />
                    </FormControl>
                    <FormControl label={<Block display='flex'><LabelSmall>概述</LabelSmall><LabelXSmall color='primary400'>（非必填）</LabelXSmall></Block>}>
                        <Input size='compact' required value={organization?.summary || ''} onChange={e => setOrganization(prev => ({ ...prev, summary: e.target.value }))} />
                    </FormControl>
                    <FormControl label={<Block display='flex'><LabelSmall>Logo</LabelSmall><LabelXSmall color='primary400'>（非必填）</LabelXSmall></Block>}>
                        <Input size='compact' value={organization?.logo || ''} onChange={e => setOrganization(prev => ({ ...prev, logo: e.target.value }))} />
                    </FormControl>
                    {organization?.logo && <Block maxWidth='64px' maxHeight='64px'><img src={organization?.logo} width='100%' height='100%' /></Block>}
                    <FormControl label={<Block display='flex'><LabelSmall>官网</LabelSmall><LabelXSmall color='primary400'>（非必填）</LabelXSmall></Block>}>
                        <Input size='compact' value={organization?.site || ''} onChange={e => setOrganization(prev => ({ ...prev, site: e.target.value }))} />
                    </FormControl>
                    <FormControl label={<Block display='flex'><LabelSmall>地区</LabelSmall><LabelXSmall color='primary400'>（非必填）</LabelXSmall></Block>} caption={'ISO 3166-1 三位字母代码，例如：中国 CHN'}>
                        <Input size='compact' value={organization?.country || ''} onChange={e => setOrganization(prev => ({ ...prev, country: e.target.value }))} />
                    </FormControl>
                    <FormControl label={<Block display='flex'><LabelSmall>所属用户</LabelSmall><LabelXSmall color='primary400'>（非必填）</LabelXSmall></Block>}>
                        <Input size='compact' type='number' step={1} min={1} value={organization?.userId} onChange={e => setOrganization(prev => ({ ...prev, userId: e.target.value }))} />
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

export default AdminPanelOrganizations;