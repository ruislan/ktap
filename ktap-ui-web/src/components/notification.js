import React from 'react';

import { Block } from 'baseui/block';
import { LabelMedium } from 'baseui/typography';
import { Notification as BaseNotification } from "baseui/notification"

function Notification({ kind, message }) {
    return (
        <Block paddingBottom='scale100' paddingTop='scale100'>
            <BaseNotification kind={kind} closeable overrides={{
                Body: {
                    style: {
                        width: 'auto',
                    }
                }
            }}>
                {
                    message &&
                    message.split('\n').map((line, i) => {
                        return <LabelMedium key={i} marginBottom='scale100'
                            overrides={{
                                Block: {
                                    style: {
                                        ':last-child': {
                                            marginBottom: 0
                                        }
                                    }
                                }
                            }}>
                            {line}
                        </LabelMedium>;
                    })
                }
            </BaseNotification>
        </Block>
    );
}

export default Notification;






