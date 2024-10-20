import { Block } from 'baseui/block';
import { LabelMedium } from 'baseui/typography';

function SideBox({ title, children }) {
    return (
        <Block backgroundColor='backgroundSecondary' padding='0' marginBottom='scale900'
            overrides={{
                Block: {
                    style: ({ $theme }) => ({
                        borderRadius: $theme.borders.radius300,
                        boxShadow: $theme.lighting.shadow400,
                    })
                }
            }}
        >
            {title && <LabelMedium padding='scale600'>{title}</LabelMedium>}
            {children}
        </Block>
    );
}

export default SideBox;






