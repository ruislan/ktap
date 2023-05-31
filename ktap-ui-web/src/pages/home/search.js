import React from 'react';

import { Input } from 'baseui/input';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Search as SearchIcon } from 'baseui/icon';
import { useNavigate } from 'react-router-dom';


function Search() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = React.useState('');
    const doSearch = () => {
        if (keyword && keyword.length > 0) {
            navigate(`/search/${keyword}`);
        }
    };
    return (
        <Block display='flex' alignItems='center' width='100%' justifyContent='space-between' marginBottom='scale600' paddingLeft='scale0' paddingRight='scale0'>
            <Block flex={1}>
                <Input
                    overrides={{
                        StartEnhancer: {
                            style: () => ({
                                paddingLeft: '0px'
                            })
                        }
                    }}
                    value={keyword}
                    startEnhancer={<SearchIcon size='18px' />}
                    onChange={e => setKeyword(e.target.value)}
                    size='compact'
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            doSearch();
                        }
                    }}
                    clearable
                    placeholder='搜一搜'
                />
            </Block>
            <Block marginLeft='scale300'>
                <Button kind='secondary' size='compact' disabled={!keyword} onClick={e => {
                    e.preventDefault();
                    doSearch();
                }}>搜索</Button>
            </Block>
        </Block>
    );
}

export default Search;
