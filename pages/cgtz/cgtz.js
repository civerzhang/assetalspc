/**
 * Created by Administrator on 2017/1/10.
 */
app.controller('cgtzController', function($scope, selfac, tql) {

    // 显示数据
    $scope.cgtz = {
        //表格展示区
        head: ["证券代码", "证券名称", "涨幅(%)", "最新价", "持仓市值", "持仓比例(%)", "每股收益", "每股净资产", "市盈率", "总市值", "流通市值", "行业名称"],
        dict: ["product_code", "product_name", "rate_close_price", "close_price", "asset", "rate_asset", "MGSY", "MGJZC", "SYL", "ZGB", "LTGB", "hycode_name"],
        body: [],
        //绘图展示用数据
        //["证券名称", "持仓比例", "每股收益", "每股净资产", "市盈率", "总股本", "流通股本"],
        dict1: ["product_name", "rate_asset", "MGSY", "MGJZC", "SYL", "ZGB", "LTGB"],
        pic: []
    };

    $scope.positions = []; //图形纵轴刻度线
    $scope.maxleft = 0; //左轴最大值
    $scope.cgtzList = []; //持股数据
    $scope.cgtzIndex = 1; //图形切换标志
    $scope.loadstate = "查询中";

    //日期控件初始化
    $(".form_datetime").datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd',
        autoclose: true, // 选择日期后关闭
        todayBtn: true, // 显示today标签
        minView: 2, // 时间选择精度精确到天
        todayHighlight: true // 当前日期高亮显示
    });

    //初始化日期
    $scope.date = {
        start: selfac["dateFormat"](-90, 'Y-M-D'),
        end: selfac["dateFormat"](0, 'Y-M-D')
    }

    // 表格颜色加载
    $scope.getClass = function getClass(idx,list) {
        var t = $scope.cgtz.dict[idx];
        return {
            nameOrange: t=="product_name"||t=="product_code",
            syRed: t=="rate_close_price"&&parseFloat(list[idx])>0,
            syGray: t=="rate_close_price"&&parseFloat(list[idx])==0,
            syGreen: t=="rate_close_price"&&parseFloat(list[idx])<0,
        };
    };

    // 表格高度设置
    $scope.getHeight = function getHeight() {
        var height = $(".table-responsive")[0].offsetHeight;
        var hh = $("thead").css("height");
        hh = Number(hh.split("px")[0]);
        height = height-hh-10;
        var hStr = height+"px";
        return{
            "max-height": hStr
        }
    };

    $scope.newData = function() {
        tql.home['用户区间收益查询']({
            'op_flag': 29,
            'date_start': $scope.date.start.replace(/\-/g, ''),
            'date_end': $scope.date.end.replace(/\-/g, ''),
            'order_field': '',
            'order_flag': '1',
            'cond_json': '{\"open_qty!\":0}',
            // 'cond_json': '',
            '@POS': 0,
            '@COUNT': -1
        }, "JSONIX", true).then(function(res) {
            $scope.cgtzList = res.list;
            if ($scope.cgtzList.length > 0) {
                $scope.loadstate = '查询到数据';
                $scope.cgtz.body = [];
                $scope.showData();
                var lis = []
                for (var i = 0; i < $scope.cgtzList.length; i++) {
                    var item = {};
                    item.Code = $scope.cgtzList[i]["product_code"];
                    item.Setcode = Number($scope.cgtzList[i]["setcode"]);
                    lis.push(item);
                    //var lis = [{"Code":"600007","Setcode": 1},{"Code":"600009","Setcode": 1},{"Code":"600006","Setcode": 1}];
                    //20只股票查一次个股行情
                    if (lis.length == 20 || (i == $scope.cgtzList.length - 1)) {
                        var hqParam = {
                            //行情请求数据：每股收益、每股净资产、市盈率、总股本、流通股本
                            "WantCol": ["MGSY", "MGJZC", "SYL", "ZGB", "ACTIVECAPITAL"],
                            "Secu": lis
                        };
                        __hqCallTql.send('HQServ.CombHQ', hqParam, function(r) {
                            //个股行情数据提取
                            r = JSON.parse(r);
                            var a = r.List,
                                b = r.ListHead;
                            for (var i = 0; i < a.length; i++) {
                                for (var j = 0; j < $scope.cgtzList.length; j++) {
                                    if ($scope.cgtzList[j]["product_code"] == a[i][b.indexOf("Code")]) {
                                        $scope.cgtzList[j]["MGSY"] = a[i][b.indexOf("MGSY")]; //每股收益
                                        $scope.cgtzList[j]["MGJZC"] = a[i][b.indexOf("MGJZC")]; //每股净资产
                                        $scope.cgtzList[j]["SYL"] = a[i][b.indexOf("SYL")]; //市盈率
                                        $scope.cgtzList[j]["ZGB"] = a[i][b.indexOf("ZGB")] * $scope.cgtzList[j]["close_price"]; //总市值=总股本*最新价
                                        $scope.cgtzList[j]["LTGB"] = a[i][b.indexOf("ACTIVECAPITAL")] * $scope.cgtzList[j]["close_price"]; //流通市值=流通股本*最新价
                                    }
                                }
                            }
                            $scope.showData();
                            $scope.$apply();
                        });
                        lis.length = 0;
                    }
                }
            } else {
                $scope.loadstate = '未查询到数据';
                $scope.cgtz.body = [
                    ["未查询到数据"]
                ];
                var i = 1;
                while (i < $scope.cgtz.head.length) {
                    $scope.cgtz.body[0].push("");
                    i++
                }
                $scope.showData();
            }
        }, function(reason) {
            $scope.loadstate = '查询失败';
            $scope.errorinof = reason;
            $scope.cgtz.body = [
                ["查询失败"]
            ];
            var i = 1;
            while (i < $scope.cgtz.head.length) {
                $scope.cgtz.body[0].push("");
                i++
            }
            $scope.showData();
        });
    };

    //展示数据格式化
    $scope.showData = function() {
        //表格展示区
        for (var i = 0; i < $scope.cgtzList.length; i++) {
            var item = [];
            for (var j = 0; j < $scope.cgtz.dict.length; j++) {
                var d = $scope.cgtzList[i][$scope.cgtz.dict[j]];
                if ($scope.cgtz.dict[j] == "product_code" || $scope.cgtz.dict[j] == "product_name" || $scope.cgtz.dict[j] == "hycode_name") {

                } else if ($scope.cgtz.dict[j] == "ZGB" || $scope.cgtz.dict[j] == "LTGB") {
                    if (!isNaN(parseFloat(d))) {
                        d = parseFloat(d);
                        if (Math.abs(d) > 99999999) {
                            d = d / 100000000;
                            d = d.toFixed(2);
                            d += '万亿'
                        } else if (Math.abs(d) > 9999) {
                            d = d / 10000;
                            d = d.toFixed(2);
                            d += '亿'
                        } else d = d.toFixed(2)
                    }
                } else if (!isNaN(parseFloat(d))) {
                    d = parseFloat(d);
                    if($scope.cgtz.dict[j] == "SYL"&&d<0){
                        d = "--"
                    }else if (Math.abs(d) > 99999999) {
                        d = d / 100000000;
                        d = d.toFixed(2);
                        d += '亿'
                    } else if (Math.abs(d) > 9999) {
                        d = d / 10000;
                        d = d.toFixed(2);
                        d += '万'
                    } else d = d.toFixed(2)
                }

                item.push(d);
            }
            $scope.cgtz.body[i] = item;
        }
        //图标展示区
        for (var m = 0; m < $scope.cgtz.dict1.length; m++) {
            var item1 = [];
            for (var n = 0; n < $scope.cgtzList.length; n++) {
                var d = $scope.cgtzList[n][$scope.cgtz.dict1[m]];
                if (!isNaN(parseFloat(d))&&$scope.cgtz.dict1[m]!="product_name") {
                    d = parseFloat(d);
                }else if($scope.cgtz.dict1[m]!="SYL"&&d<0){
                    d=0;
                }
                item1.push(d);
            }
            $scope.cgtz.pic[m] = item1;
        }
        data.seriesData = $scope.cgtz.pic[2]
        $scope.draw();
    };

    //图片数据源    dict1: ["product_name", "rate_asset", "MGSY", "MGJZC", "SYL","ZGB","LTGB"],
    var data = {
        title: "每股收益",
        yAxisTitle: "每股收益",
        seriesName: "每股收益",
        seriesData: $scope.cgtz.pic[2]
    }
    $scope.changeData = function(val) {
        $scope.cgtzIndex = val;
        switch (val) {
            case 1:
                data = {
                    title: "每股收益",
                    yAxisTitle: "每股收益(元)",
                    seriesName: "每股收益",
                    seriesData: $scope.cgtz.pic[2]
                }
                break;
            case 2:
                data = {
                    title: "每股净资产",
                    yAxisTitle: "每股净资产(元)",
                    seriesName: "每股净资产",
                    seriesData: $scope.cgtz.pic[3]
                }
                break;
            case 3:
                data = {
                    title: "市盈率",
                    yAxisTitle: "市盈率(元)",
                    seriesName: "市盈率",
                    seriesData: $scope.cgtz.pic[4]
                }
                break;
            default:
                break;
        }
        $scope.draw();
    };

    // 绘图
    $scope.draw = function() {
        $scope.positions = [];
        console.log($scope.cgtz.pic[0]);
        console.log($scope.cgtz.pic[1]);
        console.log($scope.cgtz.pic[2]);
        // !isNaN($scope.cgtz.pic[2][$scope.cgtz.pic[2].length - 1])
        if (!isNaN($scope.cgtz.pic[2][$scope.cgtz.pic[2].length - 1])) {
            $('#cgtzBox').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: null, //data.title,
                    align: 'left',
                    style: {
                        fontWeight: 'bold'
                    }
                },
                credits: {
                    enabled: false,
                    text: '大通证券',
                    //href: 'http://www.baidu.com'
                },
                legend: {
                    align: 'center',
                    verticalAlign: 'top',
                    y: 20
                },
                colors: ['#52D1DC', '#FFB400', '#fa53ae','#00A6ED', '#ab3eff'],
                tooltip: {
                    shared: true,
                    useHTML: true,
                    headerFormat: '<b>{point.key}</b><table>',
                    pointFormat: '<tr><td style="">{series.name}: </td>' +
                        '<td style="text-align: right"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                xAxis: {
                    categories: $scope.cgtz.pic[0],
                    crosshair: true,
                    tickInterval: parseInt($scope.cgtz.pic[0].length / 12),
                    labels: {
                        rotation: 0,
                        style: {
                            //color: 'red',
                            fontWeight: 'bold', //刻度字体加粗
                            fontSize: 12, //刻度字体大小
                                //fontFamily: "YouYuan"//"STSong"
                        }
                    }
                },
                yAxis: [{
                    tickPositioner: function() {
                        if(this.dataMax==this.dataMin){
                            return [this.dataMax-this.dataMax,this.dataMax,this.dataMax+this.dataMax];
                        }
                        $scope.maxleft = this.dataMax;
                        tick = Math.floor(this.dataMin);
                        increment = Math.ceil((this.dataMax - this.dataMin) / 6);
                        for (tick; tick - increment <= this.dataMax; tick += increment) {
                            $scope.positions.push(tick);
                        }
                        return $scope.positions;
                    },
                    title: {
                        text: data.yAxisTitle
                    },
                    gridLineDashStyle: "dash"
                }, {
                    // 右侧纵轴
                    opposite: true,
                    // tickPositions: $scope.positions,

                    tickPositioner: function() {
                        if(this.dataMax==this.dataMin){
                            return [this.dataMax-this.dataMax,this.dataMax,this.dataMax+this.dataMax];
                        }
                        var pos2 = this.positioner;
                        if ($scope.positions.length>0) {
                            var par = (this.dataMax + Math.random()) / $scope.positions[$scope.positions.length - 1];
                            pos2 = $scope.positions.map(function(x) {
                                return x * par;
                            })
                        }
                        return pos2;
                    },
                    labels: {
                        rotation: 0,
                        formatter: function() {
                            var x = this.value;
                            var y = String(x).indexOf(".") + 1; //获取小数点的位置
                            var count = String(x).length - y; //获取小数点后的个数
                            if (count > 2) {
                                x = x.toFixed(2);
                            }
                            if (Math.abs(x) <0.01) {
                                x = 0;
                            }
                            return x;
                        }
                    },
                    title: {
                        text: '仓位比(%)'
                    },
                    gridLineDashStyle: "dash"
                }],
                series: [{
                    name: data.seriesName,
                    data: data.seriesData
                        //                data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5],
                }, {
                    yAxis: 1,
                    name: '仓位比',
                    data: $scope.cgtz.pic[1]
                }]
            });
        }
    };

    //启动加载
    $scope.newData();

    //自定义时间查询
    $scope.cxData = function() {
        var $date = $('.nav li input[type="text"]');
        $scope.date.start = $date.eq(0).val();
        $scope.date.end = $date.eq(1).val();
        $scope.cgtzIndex = 1;
        $scope.newData();
    }
});