import { Block } from 'baseui/block';
import { DisplayMedium, LabelMedium, ParagraphMedium } from 'baseui/typography';

function Terms() {
    return (
        <Block display='flex' alignItems='center' flexDirection='column' maxWidth='664px' margin='48px auto' padding='scale600'>
            <DisplayMedium marginBottom='scale600'>服务协议</DisplayMedium>
            <Block display='flex' justifyContent='space-between' alignItems='center' marginBottom='scale600'>
                <LabelMedium color='primary300'>更新于 2023-01-01</LabelMedium>
            </Block>
            <ParagraphMedium color='primary100' marginBottom='scale600' alignSelf='flex-start'>
                当你在使用 KTap 的服务时，您应该遵守本服务协议。本服务协议适用于所有使用 KTap 的用户。
            </ParagraphMedium>
            <ParagraphMedium color='primary100' marginBottom='scale600' alignSelf='flex-start'>
                待完善
            </ParagraphMedium>
        </Block>
    );
}

export default Terms;