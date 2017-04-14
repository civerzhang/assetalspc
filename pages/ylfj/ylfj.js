/**
 * Created by Administrator on 2017/1/10.
 */
app.controller('ylfjController', function($scope, selfac, tql) {
    //日期控件初始化
    $(".form_datetime").datetimepicker({
        language: "zh-CN",
        format: "yyyy-mm-dd",
        autoclose: "true",
        todayBtn: true,
        minView: 2,
        todayHighLight: true
    });

    // 显示数据格式化
    $scope.ylfj = {
        //表格展示区
        head: ["证券代码", "证券名称","本期盈利", "本期收益(%)", "期初持股", "期间增仓次数", "期间增仓股数", "期间减仓次数", "期间减仓股数", "期末市价", "期末持仓", "期末市值",  "期间持仓天数"],
        dict: ["product_code", "product_name","profit", "rate_profit", "init_qty", "count_inc", "total_inc_qty", "count_dec", "total_dec_qty", "close_price", "open_qty", "asset",  "hold_day"],
        body: [],
        //盈亏分布图
        //["收益","证券名称","持仓天数"]
        dict1: ["profit", "product_name", "hold_day"],
        pic: []
    };
    $scope.ylfj1 = {
        //盈亏走势图
        //["日期", "本金", "资产", "收益"]
        dict: ["bal_date", "total_principal", "asset", "profit"],
        pic: []
    };
    // 表格颜色加载
    $scope.getClass = function getClass(idx,list) {
        var t = $scope.ylfj.dict[idx];
        var zhdl = 0;
        if(t=="profit"||t=="rate_profit"){zhdl=1};
        return {
            nameOrange: t=="product_name"||t=="product_code",
            syRed: zhdl&&parseFloat(list[idx])>0,
            syGray: zhdl&&parseFloat(list[idx])==0,
            syGreen: zhdl&&parseFloat(list[idx])<0,
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
    //格式化获取数据用以展示
    $scope.showData = function() {
        var dshow = $scope.ylfj,
            dgot = $scope.ylfjList;
        //表格展示区
        for (var i = 0; i < dgot.length; i++) {
            var item = [];
            for (var j = 0; j < dshow.dict.length; j++) {
                var d = dgot[i][dshow.dict[j]]
                if (dshow.dict[j] == "close_price" || dshow.dict[j] == "asset" || dshow.dict[j] == "rate_profit"||dshow.dict[j] == "profit") {
                    if (!isNaN(parseFloat(d))) {
                        d = parseFloat(d);
                        if (Math.abs(d) > 99999999) {
                            d = d / 100000000;
                            d = d.toFixed(2);
                            d += '亿'
                        } else if (Math.abs(d) > 9999) {
                            d = d / 10000;
                            d = d.toFixed(2);
                            d += '万'
                        } else if (dshow.dict[j] != "profit"){
                            d = d.toFixed(2)
                        }
                    }
                };
                item.push(d);
            }
            dshow.body[i] = item;
        }
        //图标展示区
        for (var m = 0; m < dshow.dict1.length; m++) {
            var item1 = [];
            for (var n = 0; n < dgot.length; n++) {
                var d = dgot[n][dshow.dict1[m]];
                if (dshow.dict1[m] == "profit") {
                    if (!isNaN(parseFloat(d))) {
                        d = parseFloat(d);
                        if (Math.abs(d) > 99999999) {
                            d = d / 100000000;
                            d = d.toFixed(2)
                        } else {
                            d = d / 10000;
                            d = d.toFixed(2)
                        } 
                    }
                };
                if(dshow.dict1[m]!="product_name"){
                    if (!isNaN(parseFloat(d))) {
                    d = parseFloat(d);
                    }
                }
                item1.push(d);
            }
            dshow.pic[m] = item1;
        }
        
        $scope.draw(2);
    };
    $scope.showData1 = function() {
        var dshow = $scope.ylfj1,
            dgot = $scope.ylfjList;
        for (var m = 0; m < dshow.dict.length; m++) {
            var item1 = [];
            for (var n = 0; n < dgot.length; n++) {
                var d = dgot[n][dshow.dict[m]];
                if (dshow.dict[m] != "bal_date") {
                    if (!isNaN(parseFloat(d))) {
                        d = parseFloat(d);
                        if (Math.abs(d) > 99999999) {
                            d = d / 100000000;
                        } else {
                            d = d / 10000;
                        } 
                    }
                };
                item1.push(d);
            }
            dshow.pic[m] = item1;
        }
        $scope.draw(1);
    }

    //获取证券持仓
    $scope.ylfjList = [];
    $scope.picIndex = 1;
    $scope.loadstate = "查询中";
    $scope.g_toDay = function(n) {
        if (!n) {
            n = 0;
        }
        var d = new Date();
        d = new Date(d.getTime() + n * 24 * 3600 * 1000)
        var year = d.getFullYear();
        var mon = d.getMonth() + 1;
        var day = d.getDate();
        var g_MaxDate = '' + year + (mon < 10 ? ('0' + mon) : mon) + (day < 10 ? ('0' + day) : day);
        return g_MaxDate;
    };
    //初始化日期
    $scope.date = {
        start: selfac["dateFormat"](-90, 'Y-M-D'),
        end: selfac["dateFormat"](0, 'Y-M-D')
    };
    $scope.requestData = function(op_flag) {
        tql.home['用户区间收益查询']({
            'op_flag': op_flag, //29-自定义日期区间持仓收益；54-投入产出统计
            'date_start': $scope.date.start.replace(/\-/g, ''),
            'date_end': $scope.date.end.replace(/\-/g, ''),
            'order_field': '',
            'order_flag': '1',
            'cond_json': '',
            '@POS': 0,
            '@COUNT': -1
        }, "JSONIX", true).then(function(res) {
            $scope.ylfjList = res.list;
            if ($scope.ylfjList.length > 0) {
                $scope.loadstate = '查询到数据';
                if (op_flag == 29) {
                    $scope.ylfj.body = [];
                    $scope.showData();
                    $scope.$apply();
                } else {
                    $scope.showData1();
                }
            } else {
                $scope.loadstate = '未查询到数据';
                if (op_flag == 29) {
                    $scope.ylfj.body = [
                        ["未查询到数据"]
                    ];
                    var i = 0;
                    while (i < $scope.ylfj.head.length) {
                        $scope.ylfj.body[0].push("");
                        i++
                    }
                    $scope.showData();
                    $scope.$apply();
                } else {
                    $scope.ylfj1.pic = [
                        [""]
                    ];
                    $scope.showData1();

                }

            }
        }, function(reason) {
            $scope.loadstate = '查询失败';
            $scope.errorinof = reason;
            if (op_flag == 29) {
                $scope.ylfj.body = [
                    ["查询失败"]
                ];
                var i = 0;
                while (i < $scope.ylfj.head.length) {
                    $scope.ylfj.body[0].push("");
                    i++
                }
                $scope.showData();
            } else {
                $scope.ylfj1.pic = [
                    [""]
                ];
                $scope.showData1();

            }
        });
    };
    $scope.newData = function() {
        $scope.requestData(29);
        $scope.requestData(54);
    };
    $scope.newData();
    $scope.cxData = function() {
        var $date = $('.nav li input[type="text"]');
        $scope.date.start = $date.eq(0).val();
        $scope.date.end = $date.eq(1).val();

        $scope.picIndex = 1;
        $scope.newData();
    }

    //绘图
    $scope.draw = function(flag) {
        // console.log(JSON.stringify($scope.ylfj1.pic))
        // console.log(JSON.stringify($scope.ylfj.pic))
        if (flag == 1) {
            $('#ylfjBox').highcharts({
                title: {
                    text: null, //'盈亏走势图',
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
                colors: ['#52D1DC', '#FFB400', '#fa53ae','#00A6ED', '#ab3eff'],
                legend: {
                    align: 'center',
                    verticalAlign: 'top',
                    y: 20
                },
                tooltip: {
                    shared: true,
                    valueDecimals: 2,
                    // valueSuffix: '万'
                },
                xAxis: {
                    //categories: a[0],
                    crosshair: true,
                    categories: $scope.ylfj1.pic[0],
                    tickmarkPlacement: 'on',
                    //tickWidth: 0,
                    tickInterval: parseInt(($scope.ylfj1.pic[0]).length / 12),
                    //type: 'datetime',
                    labels: {
                        rotation: 0,
                        formatter: function() {
                            var d = this.value;
                            d = String(d);
                            d = d.substr(0, 4) + "-" + d.substr(4, 2) + "-" + d.substr(6, 2)
                            return d;
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: '单位（万）'
                    },
                    labels: {
                        rotation: 0,
                        formatter: function() {
                            if (Math.abs(this.value) > 9999) {
                                this.value = this.value / 10000
                            };
                            return this.value;
                        },
                        style: {
                            //color: 'red',
                            // fontWeight: 'bold', //刻度字体加粗
                            fontSize: 12, //刻度字体大小
                                //fontFamily: "YouYuan"//"STSong"
                        }
                    },
                    gridLineDashStyle: "dash"
                },
                plotOptions: {
                    series: {
                        //pointStart: Date.UTC(2010, 0, 1),
                        //pointInterval: 24 * 3600 * 1000 ,
                        marker: {
                            enabled: false
                        }
                    }
                },
                series: [{
                    type: 'spline', //折线图
                    name: '累计投入',
                    data: $scope.ylfj1.pic[1]
                }, {
                    type: 'area', //面积图
                    name: '总资产',
                    data: $scope.ylfj1.pic[2]
                }, {
                    type: 'area', //面积图
                    name: '总盈利',
                    data: $scope.ylfj1.pic[3],
                    color:'#ff3e3e',
                    negativeColor: '#7FB800',//设置负值的颜色
                }]
            });
        } else {
            $('#ylfjBox').highcharts({
                title: {
                    text: null, //'盈亏分布图',
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
                        '<td style="text-align: left"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                },
                xAxis: {
                    crosshair: true,
                    categories: $scope.ylfj.pic[1],
                    tickmarkPlacement: 'on',
                    tickInterval: parseInt(($scope.ylfj.pic[1]).length / 12),
                    //type: 'datetime',
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
                    title: {
                        text: '盈亏（万）'
                    },
                    labels: {
                        rotation: 0,
                        formatter: function() {
                            if (Math.abs(this.value) > 9999) {
                                this.value = this.value / 10000 
                            };
                            return this.value;
                        },
                        style: {
                            //color: 'red',
                            // fontWeight: 'bold', //刻度字体加粗
                            fontSize: 12, //刻度字体大小
                                //fontFamily: "YouYuan"//"STSong"
                        }
                    },
                    gridLineDashStyle: "dash"
                }, {
                    opposite: true,
                    title: {
                        text: '持仓（天）'
                    },
                    gridLineDashStyle: "dash"
                }],
                plotOptions: {
                    column: {
                        maxPointWidth: 5,
                        borderWidth: 0,
                    },
                    series: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                series: [{
                    type: 'area', //面积图
                    name: '盈亏总额',
                    data: $scope.ylfj.pic[0],
                    color:'#ff3e3e',
                    negativeColor: '#7FB800',//设置负值的颜色
                }, {
                    type: 'column', //条形图
                    name: '持仓天数',
                    yAxis: 1,
                    data: $scope.ylfj.pic[2],
                }]
            });
        }
    }

    // 图切换
    $scope.disPic = function(flag) {
        $scope.picIndex = flag;
        $scope.draw(flag);
        // return flag;
    }
});

