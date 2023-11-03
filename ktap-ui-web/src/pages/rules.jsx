import { Block } from 'baseui/block';
import { DisplayMedium, LabelMedium, HeadingSmall, ParagraphMedium } from 'baseui/typography';

function Rules() {
    return (
        <Block display='flex' alignItems='center' flexDirection='column' maxWidth='664px' margin='48px auto' padding='scale600'>
            <DisplayMedium marginBottom='scale600'>规则手册</DisplayMedium>
            <LabelMedium color='primary300' display='flex' justifyContent='space-between' alignItems='center' marginBottom='scale600'>更新于 2023-01-01</LabelMedium>
            <ParagraphMedium color='primary100'>
                这些规则适用于KTap用户可发布的所有内容，包括但不限于：评测、回复、图片、标签。
            </ParagraphMedium>
            <ParagraphMedium color='primary100'>
                请注意，无论在任何时候，管理员/网站编辑都拥有更改/编辑/删除/移动/合并任何内容的权限，只要他们认为这些内容是不恰当的、违规的或分类错误的。
            </ParagraphMedium>
            <HeadingSmall marginBottom='scale300'>通则</HeadingSmall>
            <Block color='primary100'>
                <LabelMedium>请勿进行下列行为：</LabelMedium>
                <ul>
                    <li>人身攻击或辱骂其他成员</li>
                    <li>绕过任何过滤器</li>
                    <li>滥用或鼓励滥用帖子举报系统</li>
                    <li>发布个人身份信息（如姓名、地址、电子邮件地址、电话号码等）</li>
                    <li>顶帖</li>
                    <li>脱离主题</li>
                    <li>发布钓鱼网站的链接</li>
                    <li>发布毫无意义的内容（如 +1、十五字回帖、恶搞链接）或重新发布被管理员关闭、修改或删除的内容</li>
                    <li>反复在不正确的论坛发帖（如：交易请求应发在交易论坛）</li>
                    <li>公开与版主发生争吵</li>
                    <li>操纵用户评测系统或投票/评级系统</li>
                </ul>
            </Block>
            <HeadingSmall marginBottom='scale300'>内容发布原则</HeadingSmall>
            <Block color='primary100'>
                <LabelMedium>请勿发布以下内容：</LabelMedium>
                <ul>
                    <li>色情内容、不当或侮辱内容、盗版拷贝、泄漏内容或其他任何不适合在工作场所浏览的内容</li>
                    <li>讨论盗版，包括但不限于：破解，密钥生成器，控制台模拟器</li>
                    <li>作弊、黑客、游戏漏洞</li>
                    <li>暴力或骚扰威胁，即便只是玩笑</li>
                    <li>发布受到版权保护的内容，如杂志扫描内容</li>
                    <li>拉客、乞讨、拍卖、抽奖、出售、广告、推销</li>
                    <li>种族主义、歧视</li>
                    <li>污言秽语，包括咒骂</li>
                    <li>毒品、酒精</li>
                    <li>宗教、政治、以及其他“容易引发争吵”的内容</li>
                </ul>
            </Block>
            <HeadingSmall marginBottom='scale300'>处罚规则</HeadingSmall>
            <Block color='primary100'>
                <ParagraphMedium>初犯将被删除违禁内容, 并被禁言24小时; 再犯将被删除违禁内容, 并被封号72小时; 三犯将被注销账号, 清除所有相关内容。</ParagraphMedium>
            </Block>
        </Block>
    );
}

export default Rules;