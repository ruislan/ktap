import React from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useStyletron } from 'baseui/styles';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Input, StatefulInput } from 'baseui/input';
import { HeadingSmall, LabelSmall } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { OptionList, StatefulMenu } from 'baseui/menu';
import { StatefulPopover } from 'baseui/popover';
import { ArrowLeft, ArrowRight, Filter, Overflow, Check, Plus, Delete } from 'baseui/icon';
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE } from 'baseui/modal';
import { FormControl } from 'baseui/form-control';
import { useSnackbar } from 'baseui/snackbar';
import { RadioGroup, Radio } from "baseui/radio";
import { Textarea } from 'baseui/textarea';
import { MOBILE_BREAKPOINT, PAGE_LIMIT_SMALL } from '../../../constants';
import { Rocket, Eye } from '../../../components/icons';

function AdminPanelApps() {
    const limit = PAGE_LIMIT_SMALL;
    const { enqueue } = useSnackbar();
    const navigate = useNavigate();
    const [css, theme] = useStyletron();
    const [isLoading, setIsLoading] = React.useState(false);
    const [data, setData] = React.useState(null);
    const [skip, setSkip] = React.useState(0);
    const [total, setTotal] = React.useState(0);
    const pageInputRef = React.useRef(null);
    const [hasNext, setHasNext] = React.useState(false);
    const [hasPrev, setHasPrev] = React.useState(false);
    const [keyword, setKeyword] = React.useState('');
    const [hasReviews, setHasReviews] = React.useState(false);
    const keywordRef = React.useRef(null);

    const [isOpenNewModal, setIsOpenNewModal] = React.useState(false);
    const [name, setName] = React.useState('');

    const [isOpenSteamModal, setIsOpenSteamModal] = React.useState(false);
    const [steamType, setSteamType] = React.useState('api');
    const [steamAppId, setSteamAppId] = React.useState('');
    const [steamAppJson, setSteamAppJson] = React.useState('');

    const handleFetchSteam = async () => {
        if (steamType === 'api' && (!steamAppId || steamAppId.length < 0)) return;
        if (steamType === 'json' && (!steamAppJson || steamAppJson.length < 0)) return;
        try {
            setIsLoading(true);
            const res = await fetch('/admin/apps/monkey/steam', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ steamType, steamAppId, steamAppJson }),
            });
            if (res.ok) {
                const json = await res.json();
                setSteamAppId('');
                setIsOpenSteamModal(false);
                navigate(`/admin-panel/apps/${json.data.id}`);
            } else {
                enqueue({ message: '抓取失败，可能超时了或者游戏已经存在，请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetApps = React.useCallback(async () => {
        try {
            setIsLoading(true);
            let url = `/admin/apps?keyword=${keywordRef.current.value || ''}&skip=${skip}&limit=${limit}`;
            if (hasReviews) url += `&hasReviews=${hasReviews}`;
            const res = await fetch(url);
            if (res.ok) {
                const json = await res.json();
                setData(json.data);
                setTotal(json.count);
                setHasNext(json.skip + json.limit < json.count);
                setHasPrev(json.skip + json.limit > json.limit);
            }
        } finally {
            setIsLoading(false);
        }
    }, [limit, skip, hasReviews]);

    const handleNew = async () => {
        if (!name || name.length < 0) return;
        try {
            setIsLoading(true);
            const res = await fetch('/admin/apps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });
            if (res.ok) {
                const json = await res.json();
                setName('');
                setIsOpenNewModal(false);
                navigate(`/admin-panel/apps/${json.data.id}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        handleGetApps();
    }, [handleGetApps]);

    return (
        <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600'>
            <HeadingSmall marginTop='0' marginBottom='scale900'>游戏列表</HeadingSmall>
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
                            skip === 0 ? handleGetApps() : setSkip(0);
                        }}>
                        <Block flex='1'><Input inputRef={keywordRef} value={keyword} size='compact' placeholder='输入名称进行搜索...' onChange={e => setKeyword(e.target.value)} clearOnEscape clearable /></Block>
                        <Block><Button kind='secondary' size='compact' type='submit'>搜索</Button></Block>
                    </form>
                </Block>

                <Block display='flex' alignItems='center' gridGap='scale300' alignSelf='flex-end'>
                    <Block><Button title='抓取' kind='secondary' size='mini' shape='circle' onClick={e => {
                        e.preventDefault();
                        setIsOpenSteamModal(true);
                    }}><Rocket title='抓取' width={16} height={16} /></Button></Block>
                    <Block><Button title='新增' kind='secondary' size='mini' shape='circle' onClick={e => {
                        e.preventDefault();
                        setIsOpenNewModal(true);
                    }}><Plus title='新增' width={16} height={16} /></Button></Block>
                    <Block>
                        <StatefulPopover
                            focusLock
                            placement='bottomRight'
                            content={({ close }) => (
                                <StatefulMenu
                                    items={[
                                        { label: '有评测', checked: hasReviews },
                                    ]}
                                    onItemSelect={({ item }) => {
                                        switch (item.label) {
                                            case '有评测': setHasReviews(prev => !prev); break;
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
                            <TableBuilderColumn header='创建于'>
                                {row => <LabelSmall whiteSpace='nowrap'>{dayjs(row?.createdAt).format('YYYY-MM-DD HH:mm:ss')}</LabelSmall>}
                            </TableBuilderColumn>
                            <TableBuilderColumn header='操作'>
                                {(row) => (<Block display='flex' alignItems='center' gridGap='scale300'>
                                    {row.isVisible ?
                                        <Button kind='secondary' $as='a' href={`/apps/${row.id}`} target='_blank' size='mini' shape='circle'><Eye width={16} height={16} /></Button>
                                        : <Button disabled kind='secondary' size='mini' shape='circle'><Eye width={16} height={16} /></Button>
                                    }
                                    <Button kind='secondary' onClick={() => navigate(`/admin-panel/apps/${row.id}`)} size='mini' shape='circle'><Overflow width={16} height={16} /></Button>
                                </Block>)}
                            </TableBuilderColumn>
                        </TableBuilder>
                    </Block>
                )}

            <Modal onClose={() => setIsOpenNewModal(false)} closeable={false} isOpen={isOpenNewModal} animate autoFocus role={ROLE.dialog}>
                <ModalHeader>新增</ModalHeader>
                <ModalBody>
                    <FormControl label={<LabelSmall>名称</LabelSmall>} caption={'最少一个字'}>
                        <Input size='compact' required error={!name || name.length < 1} value={name} onChange={e => setName(e.target.value)}></Input>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenNewModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleNew()} isLoading={isLoading}>确定</ModalButton>
                </ModalFooter>
            </Modal>

            <Modal onClose={() => setIsOpenSteamModal(false)} closeable={false} isOpen={isOpenSteamModal} animate autoFocus role={ROLE.dialog}>
                <ModalHeader>Steam抓取</ModalHeader>
                <ModalBody>
                    <Block display='flex' alignItems='center' marginBottom='scale300'>
                        <RadioGroup value={steamType} onChange={e => setSteamType(e.currentTarget.value)} align='horizontal'>
                            <Radio value='api'>从Steam抓取</Radio>
                            <Radio value='json'>解析JSON</Radio>
                        </RadioGroup>
                    </Block>
                    {steamType === 'api'
                        ? <FormControl label={<LabelSmall>Steam App ID</LabelSmall>} caption={'例如：813780。注意：Steam 的链接有频率限制，频繁调用可能会失败。'}>
                            <Input size='compact' value={steamAppId} onChange={e => setSteamAppId(e.target.value)}></Input>
                        </FormControl>
                        : <FormControl label={<LabelSmall>Steam App API JSON</LabelSmall>} caption={'从Steam的API中获取的JSON内容（只需要data对象），上传进行解析。'}>
                            <Textarea size='compact' rows={10} value={steamAppJson} onChange={e => setSteamAppJson(e.target.value)} />
                        </FormControl>
                    }
                </ModalBody>
                <ModalFooter>
                    <ModalButton kind='tertiary' onClick={() => setIsOpenSteamModal(false)}>取消</ModalButton>
                    <ModalButton onClick={() => handleFetchSteam()} isLoading={isLoading}>确定</ModalButton>
                </ModalFooter>
            </Modal>
        </Block>
    );
}

export default AdminPanelApps;