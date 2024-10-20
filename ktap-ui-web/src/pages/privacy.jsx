import { Block } from 'baseui/block';
import { DisplayMedium, LabelMedium, ParagraphMedium } from 'baseui/typography';

function Privacy() {
    return (
        <Block display='flex' alignItems='center' flexDirection='column' maxWidth='664px' margin='48px auto' padding='scale600'>
            <DisplayMedium marginBottom='scale600'>隐私策略</DisplayMedium>
            <Block display='flex' justifyContent='space-between' alignItems='center' marginBottom='scale600'>
                <LabelMedium color='primary300'>更新于 2023-01-01</LabelMedium>
            </Block>
            <ParagraphMedium color='primary100' marginBottom='scale600'>
                KTap（以下简称“我们”）非常重视您的个人信息与隐私保护。我们深知这项责任的重要性，因此我们会按照法律要求以及业界成熟的安全标准，通过合理有效的方式保护您的个人信息。
            </ParagraphMedium>
            <Block color='primary100' alignSelf='flex-start' marginBottom='scale300'>
                <LabelMedium>适用范围：</LabelMedium>
                <ul>
                    <li>在您使用我们的服务时，我们会自动接收并记录您的浏览器数据，包括但不限于IP地址、网站Cookie中的资料及您要求取用的网页记录</li>
                    <li>在您使用我们的服务时，产生的交互信息和数字信息</li>
                    <li>我们通过合法途径从商业伙伴处取得的用户个人信息</li>
                </ul>
            </Block>
            <Block color='primary100' alignSelf='flex-start' marginBottom='scale300'>
                <LabelMedium>我们不会将上述信息出售或出借给任何第三方，但以下情况除外：</LabelMedium>
                <ul>
                    <li>事先获得您的明确授权</li>
                    <li>所收集的信息是您自行向社会公众公开的</li>
                    <li>所收集的信息是从合法公开披露的信息中收集</li>
                    <li>所收集的信息是用户自行向本网站提供的</li>
                    <li>为维护本网站的合法权益</li>
                    <li>法律法规规定的其他情形</li>
                </ul>
            </Block>
        </Block>
    );
}

export default Privacy;