import { Avatar } from 'baseui/avatar';

function AvatarSquare({ name, src, size, radius }) {
    return (
        <Avatar
            name={name}
            src={src}
            size={size}
            overrides={{
                Root: {
                    style: ({ $theme }) => ({
                        borderTopLeftRadius: radius || $theme.borders.radius200,
                        borderTopRightRadius: radius || $theme.borders.radius200,
                        borderBottomRightRadius: radius || $theme.borders.radius200,
                        borderBottomLeftRadius: radius || $theme.borders.radius200,
                    }),
                },
                Avatar: {
                    style: ({ $theme }) => ({
                        borderTopLeftRadius: radius || $theme.borders.radius200,
                        borderTopRightRadius: radius || $theme.borders.radius200,
                        borderBottomRightRadius: radius || $theme.borders.radius200,
                        borderBottomLeftRadius: radius || $theme.borders.radius200,
                    }),
                },
            }}
        />
    );
}

export default AvatarSquare;






