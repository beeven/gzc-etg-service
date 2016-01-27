# Goods商品信息库接口

## 查询接口
通过关键字查询商品信息列表
### Interface
```bash
http://172.7.1.243:3003/goods/query/:keyword
```
### Arguments
- **:keyword** 搜索的关键字
- **pageSize** 分页大小，可选，默认20。作为queryString的参数之一。
- **pageNumber** 当前页码，可选，默认1。作为queryString的参数之一。

### Returns
- **code** 正常返回0，错误返回1
- **error** 正常是undefined，错误包含错误信息
- **data** 查询返回的数组。数组里面每个对象包含以下字段
    - *GOODS_ID* 商品实际id
    - *G_NAME* 商品名称
    - *CODE_TS* 商品归类编码
    - *GOODS_DESC* 30字的描述


### example
```bash
curl http://172.7.1.243:3003/goods/query/牛?pageSize=5&pageNumber=1
```

```javascript
{
    "code": 0,
    "data": [{
        "GOODS_ID": "83557cc3-ec6c-4c97-8e78-0050cf458437",
        "G_NAME": "盐湿牛皮",
        "CODE_TS": "41015019",
        "GOODS_DESC": "整张生牛皮，盐渍处理，未鞣制、单面带毛，局部可见少量刀痕、孔"
    }, {
        "GOODS_ID": "9dd0b4da-7319-4159-a656-8289c6a9e25c",
        "G_NAME": "粒面剖层非整张牛皮革边角料",
        "CODE_TS": "4115200090",
        "GOODS_DESC": "皮革边角料是指在加工皮革货物过程中所产生的皮革边角料，不能用"
    }]
}
```


## 详细信息接口
通过商品ID查询详细信息

### Interface
```bash
http://172.7.1.245:3003/goods/details/:goodsId
```
### Arguments
- **:goodsId** 商品实际ID
### Returns
- **code** 正常返回0，错误返回1
- **error** 正常是undefined，错误包含错误信息
- **data** 商品详细信息，包含以下字段
    - *G_NAME* 商品名称
    - *CODE_TS* 商品归类编码
    - *GOODS_DESC* 商品详细描述
    - *THUMBNAILS* 缩略图，包含以下字段
        - *DATA* base64编码的 Data URL
        - *FILE_ID* 清晰图片的ID
        - *TITLE* 图片名称
    - *LOW_RATE* 最惠国税率
    - *TAX_RATE* 税率
    - *REG_RATE*
    - *OUT_RATE*
    - *RETURN_RATE* 出口退税率
    - *HS_POINTS* 规范申报要素

### example
```bash
curl http://10.53.1.181:3003/goods/details/9dd0b4da-7319-4159-a656-8289c6a9e25c
```

```javascript
{
    "code": 0,
    "data": {
        "G_NAME": "粒面剖层非整张牛皮革边角料",
        "CODE_TS": "4115200090",
        "GOODS_DESC": "皮革边角料是指在加工皮革货物过程中所产生的皮革边角料，不能用作原用途使用，也不能用于制造皮革制品。",
        "THUMBNAILS": [{
            "DATA": "Base64 Data ...",
            "FILE_ID": "755de43b-3d8c-4abe-bb65-aa3330a2cf1b",
            "TITLE": "粒面剖层非整张牛皮革边角料"
        }],
        "LOW_RATE": 0.14,
        "TAX_RATE": 0.17,
        "REG_RATE": 0,
        "OUT_RATE": 0,
        "HS_POINTS": "1.状态（块、张、条、卷、边角料、粉末）;2.用途;3.规格(厚度、面积);4.是否经过筛选"
    }
}
```


## 获取详细图片接口
通过FILE_ID获取清晰图片

### Interface
```bash
http://172.7.1.245:3003/goods/details/:fileId
```

### Arguments
- **:fileId** 文件ID

### Returns
返回二进制文件


### example

```
curl http://172.7.1.245:3003/goods/details/9dd0b4da-7319-4159-a656-8289c6a9e25c
```

```bash
Content-Type: image/jpeg
Cache-Control: max-age=86400

abbssf
```

