import React from 'react';

import { Block } from 'baseui/block';
import { LabelSmall } from 'baseui/typography';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { useSnackbar } from 'baseui/snackbar';
import { Check, Delete } from 'baseui/icon';
import { Select } from 'baseui/select';
import { Spinner } from 'baseui/spinner';

function SelectionBlock({ isDeveloper, appId, options, title, caption, }) {
    const { enqueue } = useSnackbar();
    const type = isDeveloper ? 'developers' : 'publishers';
    const [isLoading, setIsLoading] = React.useState(false);
    const [values, setValues] = React.useState([]);

    React.useEffect(() => {
        const fetchValues = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/admin/apps/${appId}/${type}`);
                if (res.ok) {
                    const json = await res.json();
                    setValues(json.data);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchValues();
    }, [appId, type]);

    const handleSave = async () => {
        if (!values || values.length === 0) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/admin/apps/${appId}/${type}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [type]: values.map(value => value.id) })
            });
            if (res.ok) {
                enqueue({ message: '保存成功', startEnhancer: ({ size }) => <Check size={size} color='positive' />, })
            } else {
                enqueue({ message: '保存失败，稍后再试，或者请联系技术人员处理', startEnhancer: ({ size }) => <Delete size={size} color='negative' />, })
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Block display='flex' flexDirection='column'>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSave();
            }}>
                <FormControl label={<LabelSmall>{title}</LabelSmall>} caption={caption}>
                    <Select options={options}
                        value={values}
                        size='compact'
                        placeholder='请选择'
                        multi
                        filterOptions={(options, filterValue) => options.filter(option => option.name.toLowerCase().includes(filterValue.toLowerCase()))}
                        getOptionLabel={({ option }) => option.name}
                        getValueLabel={({ option }) => option.name}
                        onChange={({ value }) => setValues(value)}
                    ></Select>
                </FormControl>
                <Block display='flex' marginTop='scale600'>
                    <Block><Button kind='secondary' size='compact' type='submit' isLoading={isLoading}>保存</Button></Block>
                </Block>
            </form>
        </Block>
    );
}

function AppDetailOrganizations({ data }) {
    const [options, setOptions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchOptions = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/admin/organizations/all`);
                if (res.ok) {
                    const json = await res.json();
                    setOptions(json.data);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchOptions();
    }, []);

    return (
        <Block display='flex' flexDirection='column' gridGap='scale900'>
            {isLoading ?
                <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'>
                    <Spinner $size='scale1600' $borderWidth='scale200' />
                </Block>
                :
                <>
                    <SelectionBlock appId={data.id} options={options} title='开发商' caption='可多选，如无选项，先去[组织管理]新增' isDeveloper />
                    <SelectionBlock appId={data.id} options={options} title='发行商' caption='可多选，如无选项，先去[组织管理]新增' isDeveloper={false} />
                </>
            }
        </Block>
    );
}

export default AppDetailOrganizations;