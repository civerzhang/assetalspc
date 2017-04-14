/**
 * Created by Administrator on 2017/1/10.
 */
app.controller('jyhsController', function($scope, selfac, tql) {
    //日期控件初始化
    $(".form_datetime").datetimepicker({
        language: "zh-CN",
        format: "yyyy-mm-dd",
        autoclose: "true",
        todayBtn: true,
        minView: 2,
        todayHighLight: true
    });

    // 格式化数据
    $scope.jyhs = {
        //表格展示区
        head: ["日期", "总资产", "总买入金额", "总卖出金额", "近两日平均资产", "日换手率(%)"],
        dict: ["bal_date", "asset", "inc_amt", "dec_amt", "avg_asset_td", "turnover"],
        body: [],
        //换手走势图：日期、日增量、日减量、日换手率
        dict1: ["bal_date", "inc_amt", "dec_amt", "turnover"],
        pic: []
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
        var dshow = $scope.jyhs,
            dgot = $scope.jyhsList;
        //表格展示区
        for (var i = 0; i < dgot.length; i++) {
            var item = [];
            for (var j = 0; j < dshow.dict.length; j++) {
                var d = dgot[i][dshow.dict[j]]
                if (dshow.dict[j] == "bal_date") {
                    d = String(d);
                    d = d.substr(0, 4) + "-" + d.substr(4, 2) + "-" + d.substr(6, 2)
                } else if(dshow.dict[j] == "turnover"){

                } else{
                    if (!isNaN(parseFloat(d))) {
                        d = parseFloat(d);
                        if (Math.abs(d) > 99999999) {
                            d = d / 100000000;
                            d = d.toFixed(2);
                            d += '亿'
                        } else{
                            d = d / 10000;
                            d = d.toFixed(2);
                            d += '万'
                        }
                    }
                }
                item.push(d);
            }
            dshow.body[i] = item;
        }
        //图标展示区
        for (var m = 0; m < dshow.dict1.length; m++) {
            var item1 = [];
            for (var n = 0; n < dgot.length; n++) {
                var d = dgot[n][dshow.dict1[m]];
                if (dshow.dict1[m] == "bal_date") {
                } else {
                    if (!isNaN(parseFloat(d))) {
                        d = parseFloat(d);
                    }
                    if (dshow.dict1[m] == "inc_amt"||dshow.dict1[m] == "dec_amt") {
                        d = d / 10000;
                    }
                }
                item1.push(d);
            }
            dshow.pic[m] = item1;
        }
// console.log(dshow.pic[1])
        $scope.draw();
    };

    //获取证券持仓
    $scope.jyhsList = [];
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
    $scope.newData = function() {
        tql.home['资金持仓查询']({
            'op_flag': 1,
            'date_start': $scope.date.start.replace(/\-/g, ''),
            'date_end': $scope.date.end.replace(/\-/g, ''),
            'order_field': 'bal_date',
            'order_flag': '0',
            'cond_json': '',
            '@POS': 0,
            '@COUNT': -1
        }, "JSONIX", true).then(function(res) {
            $scope.jyhsList = res.list;
            if ($scope.jyhsList.length > 0) {
                $scope.loadstate = '查询到数据';
                $scope.jyhs.body = [];
                $scope.showData();
            } else {
                $scope.loadstate = '未查询到数据';
                $scope.jyhs.body = [
                    ["未查询到数据"]
                ];
                var i = 0;
                while (i < 6) {
                    $scope.jyhs.body[0].push("");
                    i++
                }
                $scope.showData();
            }
        }, function(reason) {
            $scope.loadstate = '查询失败';
            $scope.errorinof = reason;
            $scope.jyhs.body = [
                ["查询失败"]
            ];
            var i = 0;
            while (i < 6) {
                $scope.jyhs.body[0].push("");
                i++
            }
            $scope.showData();
        });
    };

    $scope.newData();
    $scope.cxData = function() {
        var $date = $('.nav li input[type="text"]');
        $scope.date.start = $date.eq(0).val();
        $scope.date.end = $date.eq(1).val();

        $scope.newData();
    }


    $scope.draw = function() {
        $('#hszstBox').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: null, //'换手走势图',
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
                //xDateFormat: '%Y-%m-%d',
                shared: true,
                valueDecimals: 2,
                // valueSuffix: '万'
            },
            xAxis: {
                //categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                categories: $scope.jyhs.pic[$scope.jyhs.dict1.indexOf("bal_date")],
                tickmarkPlacement: 'on',
                tickInterval: parseInt(($scope.jyhs.pic[$scope.jyhs.dict1.indexOf("bal_date")]).length / 12),
                //type: 'datetime',
                labels: {
                    rotation: 0,
                    formatter: function() {
                        var d = this.value;
                        d = String(d);
                        d = d.substr(0,4)+"-"+d.substr(4,2)+"-"+d.substr(6,2)
                        return d;
                    }
                }
            },
            yAxis: [{
                title: {
                    text: '换手率 (%)'
                },
                gridLineDashStyle: "dash"
            }, {
                opposite: true,
                title: {
                    text: '金额 (万)'
                },
                gridLineDashStyle: "dash",
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
                        fontWeight: 'bold', //刻度字体加粗
                        fontSize: 12, //刻度字体大小
                            //fontFamily: "YouYuan"//"STSong"
                    }
                },
            }],
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
                name: '日换手率',
                tooltip: {
                    valueSuffix: '%'
                },
                //data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
                data: $scope.jyhs.pic[$scope.jyhs.dict1.indexOf("turnover")]
            }, {
                name: '总买入金额',
                //data: [0, 0.8, 0, 11.3, 0, 22.0, 0, 0, 20.1, 14.1, 8.6, 2.5],
                data: $scope.jyhs.pic[$scope.jyhs.dict1.indexOf("inc_amt")],
                yAxis: 1
            }, {
                name: '总卖出金额',
                //data: [0, 2, 0, 8.3, 0, 0, 0, 14.1, 10.1, 18.1, 18.6, 12.5],
                data: $scope.jyhs.pic[$scope.jyhs.dict1.indexOf("dec_amt")],
                yAxis: 1
            }],
        })
    }
});