import React from 'react';
import { Block } from 'baseui/block';
import { GenderLess, Man, Woman } from './icons';

export default function ({ gender }) {
    if (gender === 'MAN') return <Block display='flex' justifyContent='center' alignItems='center' width='scale600' marginRight='scale100'><Man /></Block>;
    if (gender === 'WOMAN') return <Block display='flex' justifyContent='center' alignItems='center' width='scale600' marginRight='scale100'><Woman /></Block>;
    if (gender === 'GENDERLESS') return <Block display='flex' justifyContent='center' alignItems='center' width='scale600' marginRight='scale100'><GenderLess /></Block>;
    return null;
}
