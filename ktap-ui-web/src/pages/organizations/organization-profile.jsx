import { Block } from 'baseui/block';
import { HeadingSmall, LabelLarge, LabelSmall, ParagraphMedium } from 'baseui/typography';

import AvatarSquare from '@ktap/components/avatar-square';

function OrganizationDataItem({ name, value }) {
    return (
        <Block display='flex' flexDirection='column' alignItems='flex-start' padding='scale300' width='100%'
            overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        backgroundColor: 'rgba(51,51,51,.6)',
                        borderRadius: $theme.borders.radius300,
                    })
                }
            }}
        >
            <HeadingSmall marginTop='0' marginBottom='0' overrides={{
                Block: {
                    style: () => ({
                        fontWeight: '700',
                    })
                }
            }}>{value}</HeadingSmall>
            <LabelSmall color='primary200' marginBottom='scale100'>{name}</LabelSmall>
        </Block>
    );
}

function OrganizationProfile({ data, meta }) {
    return (
        <Block backgroundColor='backgroundSecondary' marginBottom='scale800' padding='scale600' overrides={{
            Block: {
                style: ({ $theme }) => ({
                    borderRadius: $theme.borders.radius300,
                })
            }
        }}>

            <Block display='flex' justifyContent='flex-start'>
                {data?.logo && <AvatarSquare size='128px' src={data.logo} radius='8px' />}
            </Block>
            <Block marginTop='scale600' display='flex' flexDirection='column'>
                <Block display='flex' alignItems='center' justifyContent='flex-start' marginBottom='scale300'>
                    <LabelLarge marginRight='scale100'>{data?.name}</LabelLarge>
                </Block>
                <ParagraphMedium>{data?.summary}</ParagraphMedium>
                <Block display='flex' justifyContent='space-between' gridGap='scale300' alignItems='center' marginTop='scale600' marginBottom='scale600'>
                    <OrganizationDataItem name='发行数' value={meta?.published} />
                    <OrganizationDataItem name='开发数' value={meta?.developed} />
                </Block>
            </Block>
        </Block>
    );
}

export default OrganizationProfile;