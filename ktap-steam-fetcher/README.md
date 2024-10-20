# 说明

获取Steam的游戏详情。

运行前，可以清空fetchedGameList和gameList的内容，这样即可从头开始下载。

如果获取的内容，包含以下情况，则跳过：

* 获取的success为false
* 获取的data的type不是game
* 获取的game还未发售

太简单了，其他没啥好说的了，看代码就行。
