import React from 'react';

import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { LAYOUT_MAIN, MOBILE_BREAKPOINT } from '../../constants';

function DiscussionsTopic() {
    const [, theme] = useStyletron();

    return (
        <Block display='flex' flexDirection='column' width={LAYOUT_MAIN} marginTop='scale900' overrides={{
            Block: {
                style: {
                    [MOBILE_BREAKPOINT]: {
                        marginTop: theme.sizing.scale600,
                        width: '100%',
                        marginLeft: theme.sizing.scale300,
                        marginRight: theme.sizing.scale300,
                    }
                }
            }
        }}>
1
        </Block>
    );
}

export default DiscussionsTopic;