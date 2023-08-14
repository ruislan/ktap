import { Block } from 'baseui/block';
import { LabelXSmall } from 'baseui/typography';
import { StatefulPopover } from 'baseui/popover';

export default function Gift({ src, number, name, description, price, $size = '16px', onClick = () => { } }) {
    return (
        <StatefulPopover accessibilityType='tooltip' triggerType='hover' placement='top'
            content={() => (
                <Block display='flex' flexDirection='column' alignItems='center' width='128px' maxWidth='128px' padding='scale300'>
                    <img src={src} width='96px' height='96px' />
                    <LabelXSmall marginTop='scale100' color='primary200'>{name}</LabelXSmall>
                    <LabelXSmall marginTop='scale300' color='primary200'>{description}</LabelXSmall>
                    <LabelXSmall marginTop='scale300' color='primary300'>价值：{price}</LabelXSmall>
                </Block>
            )}
        >
            <Block onClick={onClick} display='flex' alignItems='center' overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        paddingLeft: $theme.sizing.scale200, paddingRight: $theme.sizing.scale200,
                        paddingTop: $theme.sizing.scale200, paddingBottom: $theme.sizing.scale200,
                        backgroundColor: $theme.colors.backgroundTertiary,
                        borderRadius: $theme.borders.radius200,
                        cursor: 'pointer',
                        ':hover': {
                            backgroundColor: 'rgb(71, 71, 71)',
                        }
                    })
                }
            }}>
                <img src={src} width={$size} height={$size} />
                {number && <LabelXSmall marginLeft='scale100' color='primary200'>{number}</LabelXSmall>}
            </Block>
        </StatefulPopover>
    );
}






