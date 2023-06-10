import React from 'react';

import { Block } from 'baseui/block';
import { LabelMedium, LabelSmall, MonoDisplayXSmall } from 'baseui/typography';

function Statistic({ title, subtitle, text }) {
    return (
        <Block display='flex' minWidth='180px' flexDirection='column'
            padding='scale600' margin='scale300' backgroundColor='backgroundSecondary'
            overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        boxShadow: $theme.lighting.shadow600,
                        borderRadius: $theme.borders.radius300,
                    })
                }
            }}
        >
            <Block display='flex' justifyContent='space-between' alignItems='center' marginBottom='scale300'>
                <LabelMedium>{title}</LabelMedium>
                <LabelSmall>{subtitle}</LabelSmall>
            </Block>
            <Block>
                <MonoDisplayXSmall>{text}</MonoDisplayXSmall>
            </Block>
        </Block>
    );
}

export default Statistic;






