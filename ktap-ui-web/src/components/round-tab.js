import React from 'react';

import { Block } from 'baseui/block';
import { Button } from 'baseui/button';

function RoundTab({ activeKey, names, onChange }) {
    return (
        <Block display='flex' alignItems='baseline' marginBottom='scale600' gridGap='scale100' whiteSpace='nowrap' overflow='auto'>
            {names.map((name, index) => (
                <Button key={index} kind='tertiary' size='compact' isSelected={activeKey === index} onClick={(e) => {
                    e.activeKey = index;
                    onChange(e);
                }}>
                    {name}
                </Button>
            ))}
        </Block>
    );
}

export default RoundTab;






