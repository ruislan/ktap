import { Block } from "baseui/block";
import { LabelMedium } from "baseui/typography";

import NotificationList from "./list";

export default function CompactView() {
    return (
        <Block display='flex' flexDirection='column'>
            <Block >
                <LabelMedium marginBottom='scale600'>通知中心</LabelMedium>
            </Block>
            <NotificationList />
        </Block>
    );
}