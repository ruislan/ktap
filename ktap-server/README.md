# 说明

本项目是典型的读多写少且大部分都只需要最终一致性的场景，所以后续如果出现性能问题，可以从异步、缓存、读写分离、索引等方向优化。

## 关于JWT

通常我们直接返回Token，然后客户端存储在本地，然后每次请求都带上Token。
这里我们采用将Token存储到Cookie中，客户端本身上传是会带有Cookie的，所以可以直接处理。（如果涉及跨域，注意Cookie的跨域问题）

关于到底是存储到Cookie还是localStorage中，可以自行搜索查看各自的优劣。

## 关于Timeline的设计

明确一点的是，本项目不是推特，不会在自己的页面看到所有关注的人的动态，而只是单纯的在某个用户的个人中心看到其动态即可。所以为了简单，就直接用sqlite来存储所有人的timeline。这其实是典型的读多写少，且读取也是按照时间顺序或者倒叙的情况。所以后续优化的方向可以有很多，例如时序数据库，分布式缓存等等。

当然，如果后续要发展为在个人页面也能看到所有关注的游戏或者人的动态，那么推特的架构方案是一个不错的选择，现在的方案也可以很好的过渡过去。

## 关于排行榜的设计

榜单分为列表和内容，列表是多个榜单的集合，内容是单个榜单的排名内容。

V1版本的榜单，每个榜单100个位置（所以也可以叫Top100），直接读取数据库。V1～V2之间会加入缓存，每隔20分钟或者1小时之类的频率刷新一次榜单。
V2开始榜单列表是动态的，同时榜单内容可以在后台添加当前榜单规则的DSL。

## 关于RESTful

通常情况下，GET返回200，POST都返回201，PUT和DELETE成功都返回204。

值得注意的是reply.code(204).send({...})是错误的，将挂起返回（根据HTTP协议，204响应不应该包含消息体），所以如果用204只能采用reply.code(204).send()

## Performance

MacBook Pro 16 inch. CPU i9 8 cores. MEM 16G.

测试的 API 会从数据库读取条件查询推荐的 Apps，同时还有 join 查询 Tag 等。

```shell
❯ hey -n 10000 -c 20 -m GET http://localhost:8000/api/apps/recommended

Summary:
  Total:        1.8696 secs
  Slowest:      0.0425 secs
  Fastest:      0.0002 secs
  Average:      0.0036 secs
  Requests/sec: 5348.6316

  Total data:   30950000 bytes
  Size/request: 3095 bytes

Response time histogram:
  0.000 [1]     |
  0.004 [8628]  |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.009 [1202]  |■■■■■■
  0.013 [120]   |■
  0.017 [20]    |
  0.021 [9]     |
  0.026 [4]     |
  0.030 [2]     |
  0.034 [1]     |
  0.038 [0]     |
  0.042 [13]    |


Latency distribution:
  10% in 0.0027 secs
  25% in 0.0029 secs
  50% in 0.0031 secs
  75% in 0.0037 secs
  90% in 0.0053 secs
  95% in 0.0064 secs
  99% in 0.0099 secs

Details (average, fastest, slowest):
  DNS+dialup:   0.0000 secs, 0.0002 secs, 0.0425 secs
  DNS-lookup:   0.0000 secs, 0.0000 secs, 0.0024 secs
  req write:    0.0000 secs, 0.0000 secs, 0.0052 secs
  resp wait:    0.0036 secs, 0.0002 secs, 0.0425 secs
  resp read:    0.0000 secs, 0.0000 secs, 0.0046 secs

Status code distribution:
  [200] 10000 responses
```
