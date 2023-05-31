import React from 'react';
import { Block } from 'baseui/block';
import { GenderLess, Man, Woman } from './icons';

function GenderLabel({ gender }) {
    return (
        <>
            {gender === 'MAN' && (<Block display='flex' justifyContent='center' alignItems='center' width='scale600' marginRight='scale100'><Man /></Block>)}
            {gender === 'WOMAN' && (<Block display='flex' justifyContent='center' alignItems='center' width='scale600' marginRight='scale100'><Woman /></Block>)}
            {gender === 'GENDERLESS' && (<Block display='flex' justifyContent='center' alignItems='center' width='scale600' marginRight='scale100'><GenderLess /></Block>)}
        </>
    );
}

export default GenderLabel;






