import { useState, useEffect } from "react";

function useScoreRemark({ score }) {
    const [remark, setRemark] = useState(null);
    const [color, setColor] = useState(null);
    useEffect(() => {
        setRemark(() => {
            switch (score) {
                case 1: return '垃圾可弃';
                case 2: return '无聊可玩';
                case 3: return '勉强不亏';
                case 4: return '推荐入坑';
                case 5: return '膜拜神作';
                default: return '暂无评价';
            }
        });
        setColor(() => {
            switch (score) {
                case 1: return 'grey';
                case 2: return '#21a453';
                case 3: return '#276ef1';
                case 4: return '#8c4cff'; // #633487 #50297F #3F2277 #8c4cff
                case 5: return '#f3b03c'; // #E4A844 #ff9c00 #f3b03c f6c454
                default: return 'inherit';
            }
        });
    }, [score]);
    return { remark, color };
}

export default useScoreRemark;