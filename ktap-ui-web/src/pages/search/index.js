import React from 'react';

import { Block } from 'baseui/block';
import { MOBILE_BREAKPOINT, LAYOUT_LEFT, LAYOUT_RIGHT } from '../../constants';
import SearchPanel from './search-panel';
import SideHotKeywords from './side-hot-keywords';

function Search() {
    return (
        <Block display='flex' marginTop='scale900' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    [MOBILE_BREAKPOINT]: {
                        flexDirection: 'column',
                        marginTop: $theme.sizing.scale600,
                        width: '100%',
                    },
                })
            }
        }}>
            <Block width={LAYOUT_LEFT} margin='0 8px 0 0' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            marginLeft: $theme.sizing.scale300,
                            width: 'auto',
                        }
                    })
                }
            }}>
                <SearchPanel />
            </Block>
            <Block width={LAYOUT_RIGHT} margin='0 0 0 8px'
                overrides={{
                    Block: {
                        style: ({ $theme }) => ({
                            [MOBILE_BREAKPOINT]: {
                                width: 'auto',
                                marginTop: $theme.sizing.scale900,
                                marginRight: $theme.sizing.scale300,
                            }
                        })
                    }
                }}
            >
                <SideHotKeywords />
            </Block>
        </Block>
    );
}

export default Search;