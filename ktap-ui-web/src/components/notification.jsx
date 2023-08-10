import React from 'react';

import { LabelMedium } from 'baseui/typography';
import { Notification as BaseNotification } from "baseui/notification"

function Notification({ kind, message }) {
    return (
        <BaseNotification kind={kind} closeable overrides={{
            Body: {
                style: {
                    width: 'auto',
                    marginLeft: 0,
                    marginRight: 0,
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
    );
}

export default Notification;






