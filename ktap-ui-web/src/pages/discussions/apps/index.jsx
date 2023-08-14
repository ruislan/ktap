import { Block } from "baseui/block";

import { LAYOUT_LEFT, LAYOUT_MAIN, LAYOUT_RIGHT, MOBILE_BREAKPOINT } from "@ktap/libs/utils";

import Banner from './banner';
import Channels from "./channels";
import Discussions from "./discussions";

export default function AppsLayout() {
    return (
        <Block display='flex' flexDirection='column' alignItems='center'>
            <Banner />
            <Block display='flex' width={LAYOUT_MAIN} marginTop='scale600' gridGap='scale900' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            width: '100%',
                            flexDirection: 'column',
                            paddingLeft: $theme.sizing.scale300, paddingRight: $theme.sizing.scale300,
                        }
                    })
                }
            }}>
                <Block display='flex' flexDirection='column' width={LAYOUT_RIGHT} overrides={{
                    Block: {
                        style: {
                            [MOBILE_BREAKPOINT]: {
                                width: '100%',
                            }
                        },
                    }
                }}>
                    <Channels />
                </Block>
                <Block display='flex' flexDirection='column' width={LAYOUT_LEFT} overrides={{
                    Block: {
                        style: {
                            [MOBILE_BREAKPOINT]: {
                                width: '100%',
                            }
                        },
                    }
                }}>
                    <Discussions />
                </Block>
            </Block>
        </Block>
    );
}