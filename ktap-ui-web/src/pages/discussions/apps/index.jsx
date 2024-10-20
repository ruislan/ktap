import { Block } from "baseui/block";

import { LAYOUT_DEFAULT_CONTENT, LAYOUT_DEFAULT, LAYOUT_DEFAULT_SIDE, MOBILE_BREAKPOINT } from "@ktap/libs/utils";

import Banner from './banner';
import Channels from "./channels";
import Discussions from "./discussions";

export default function AppsLayout() {
    return (
        <Block display='flex' flexDirection='column' alignItems='center'>
            <Banner />
            <Block display='flex' width={LAYOUT_DEFAULT} marginTop='scale600' gridGap='scale900' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        [MOBILE_BREAKPOINT]: {
                            width: '100%', flexDirection: 'column',
                            paddingLeft: $theme.sizing.scale300, paddingRight: $theme.sizing.scale300,
                        }
                    })
                }
            }}>
                <Block display='flex' flexDirection='column' width={LAYOUT_DEFAULT_SIDE} overrides={{
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
                <Block display='flex' flexDirection='column' width={LAYOUT_DEFAULT_CONTENT} overrides={{
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