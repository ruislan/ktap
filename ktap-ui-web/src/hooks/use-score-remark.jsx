import { useMemo } from "react";

function useScoreRemark({ score }) {
    const memo = useMemo(() => {
        switch (score) {
            case 1: return { remark: '垃圾可弃', color: 'grey' };
            case 2: return { remark: '无聊可玩', color: '#21a453' };
            case 3: return { remark: '勉强不亏', color: '#276ef1' };
            case 4: return { remark: '推荐入坑', color: '#8c4cff' };// #633487 #50297F #3F2277 #8c4cf
            case 5: return { remark: '膜拜神作', color: '#f3b03c' };// #E4A844 #ff9c00 #f3b03c f6c454
            default: return { remark: '暂无评价', color: 'inherit' };
        }
    }, [score]);
    return memo;
}

export default useScoreRemark;