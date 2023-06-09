module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 13,
        "sourceType": "module"
    },
    "plugins": [
        "baseui",
        "react-hooks"
    ],
    "rules": {
        "react/react-in-jsx-scope": "off",
        'baseui/deprecated-theme-api': "warn",
        'baseui/deprecated-component-api': "warn",
        'baseui/no-deep-imports': "warn",
        "react-hooks/rules-of-hooks": "error", // 检查 Hook 的规则
        "react-hooks/exhaustive-deps": "warn" // 检查 effect 的依赖
    }
};
