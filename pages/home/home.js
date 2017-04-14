/**
 * Created by Administrator on 2017/1/10.
 */

//我的持仓
app.controller('mainController', ['$scope', 'tql', 'selfac',
  function ($scope, tql, selfac) {
    $(".form_datetime").datetimepicker({
      language: 'zh-CN',
      format: 'yyyy-mm-dd',
      autoclose: true, // 选择日期后关闭
      todayBtn: true, // 显示today标签
      minView: 2, // 时间选择精度精确到天
      todayHighlight: true // 当前日期高亮显示
    });

    $scope.default = '--';
    //获取证券持仓
    $scope.loadstate = "查询中";

    /************ data bind start **************/
    $scope.date = {
      start: selfac["dateFormat"](-90, 'Y-M-D'),
      end: selfac["dateFormat"]('', 'Y-M-D')
    }
    $scope.syzsIndex = 0;
    $scope.sybdIndex = 0;
    $scope.zcxxIndex = 0;
    $scope.ylfjIndex = 0;
    $scope.ylfjorder = 0;//盈利分解赚钱股票 or 亏钱股票
    $scope.profits = [];

    // 账户信息
    $scope.dataZhxx = {
      'yk': 0,
      'syl': 0
    }

    // 资产信息
    $scope.dataZcxx = [{
      'zzc': $scope.default,
      'zfz': $scope.default,
      'zjye': $scope.default,
      'rzfz': $scope.default,
      'ccsz': $scope.default,
      'rqfz': $scope.default,
      'jzc': $scope.default,
      'zyfz': $scope.default,
      'moneyCode': $scope.default
    }];

    // 区间收益
    $scope.dataQjsy = {
      "qjsy": $scope.default,
      "qczc": $scope.default,
      "syl": $scope.default,
      "qjcj": $scope.default,
      "qjtr": $scope.default,
      "ljtr": $scope.default,
      "zdsz": $scope.default,
      "szqj": $scope.default,
      "zdhc": $scope.default,
      "hcqj": $scope.default
    }
    /************ data bind end **************/

    // 获取账户信息
    $scope.getZhxx = function() {
      tql.home['资金持仓查询']({
        'op_flag': 1,
        'date_start': $scope.date.end.replace(/\-/g, ''),
        'date_end': $scope.date.end.replace(/\-/g, ''),
        'order_field': '',
        'order_flag':'1',
        'cond_json': '',
        '@POS':  0,
        '@COUNT': -1
      }, "JSONIX",true).then(function (res) {
        if(res.list) {
          for(var a in res.list){
            $scope.dataZcxx[a] = new Object();
            $scope.dataZcxx[a].moneyCode = selfac["districtCode"](res.list[a]['ccy_code']);
            $scope.dataZcxx[a]["zzc"] = selfac["numberFormat"](res.list[a]["asset"]);
            $scope.dataZcxx[a]["zjye"] = selfac["numberFormat"](res.list[a]["open_bal"]);
            $scope.dataZcxx[a]["zfz"] = selfac["numberFormat"](res.list[a]["debt"]);
            $scope.dataZcxx[a]["ccsz"] = selfac["numberFormat"](res.list[a]["market_cap"]);
            $scope.dataZcxx[a]["jzc"] = selfac["numberFormat"](res.list[a]["net_asset"]);
            $scope.dataZcxx[a]["rqfz"] = '--';
            $scope.dataZcxx[a]["rzfz"] = '--';
            $scope.dataZcxx[a]["zyfz"] = '--';
          }
        }
      }, function (reason) {
        $scope.loadstate = '查询失败';
        $scope.errorinof = reason;
      });
    }

    // 获取区间收益
    $scope.getQjsy = function() {
      tql.home['资金持仓查询']({
        'op_flag': 13,
        'date_start': $scope.date.start.replace(/\-/g, ''),
        'date_end': $scope.date.end.replace(/\-/g, ''),
        'order_field': '',
        'order_flag':'1',
        'cond_json': '',
        '@POS':  0,
        '@COUNT': -1
      }, "JSONIX",true).then(function (res) {
        if(res.list.length) {
          var list = res.list[0];
          $scope.dataQjsy.qczc = selfac["numberFormat"](list["asset_first"]);
          $scope.dataQjsy.qjtr = list["inc_principal"];
          $scope.dataQjsy.ljtr = selfac["numberFormat"](list["net_principal"]);
          $scope.dataQjsy.qjcj = selfac["numberFormat"](list["trade_amt"]);
          $scope.dataQjsy.zdsz = list["rate_profit_max"];
          $scope.dataQjsy.zdhc = list["rate_profit_min"];
          $scope.dataQjsy.qjsy = list["profit"];
          $scope.dataQjsy.syl = list['rate_profit'];


          $scope.dataZhxx.yk = parseFloat($scope.dataQjsy.qjsy);
          $scope.dataZhxx.syl = parseFloat($scope.dataQjsy.syl);
        }
      }, function (reason) {
        $scope.loadstate = '查询失败';
        $scope.errorinof = reason;
      });
    }

    //处理收益走势图表
    $scope.dealQjsy = function(flag){
      //定义收益走势横坐标  日期,组合收益纵坐标和沪深300纵坐标
      var xaxisArray=new Array(),userSy=new Array(),hsSy=new Array();
      // 收益走势查询,先查询沪深300收益，然后查询用户收益
      $scope.syzsIndex = flag;
      var __syzsFlag = [2, 3, 4];
      tql.home['用户区间收益查询']({
        'op_flag': __syzsFlag[flag],
        'order_field': '',
        'order_flag':'1',
        'cond_json': {
          'exch_code':'SZSE',
          'market_code':'A',
          'product_code':'399300'
        },
        '@POS':  0,
        '@COUNT': -1
      }, "JSONIX",true).then(function(hsres) {
          for(var j in hsres.list){
            xaxisArray[j] = hsres.list[j]['bal_date'];
            hsSy[j] = parseFloat(hsres.list[j]['rate_profit_SZSE_A_399300']);
          }

          tql.home['用户区间收益查询']({
            'op_flag': __syzsFlag[flag],
            'order_field': '',
            'order_flag':'1',
            'cond_json': '',
            '@POS':  0,
            '@COUNT': -1
          }, "JSONIX",true).then(function(userres) {
              for(var s in userres.list){
                userSy[s] = parseFloat(userres.list[s]['rate_profit']);
              }
              
              chart();
          }, function(err) {
            alert('收益走势查询失败' + err);
          });

      }, function(err) {
        alert('收益走势查询失败' + err);
      });

      //定义画图函数
      var chart = function(){
          //highcharts处理数据  画图
          $('#syzs').highcharts({
              chart:{
                type:'spline'
              },
              title:{
                text:''
              },
              legend: {
                align: 'center',
                verticalAlign: 'top',
                borderWidth: 0,
              },
              xAxis:{
                categories:xaxisArray,
                crosshair:true,
                tickInterval: parseInt(xaxisArray.length/5)
              },
              credits: {
                enabled: false
              },
              tooltip: {
                shared: true
              },
              plotOptions: {
                  series: {
                      marker: {
                          enabled: false
                      }
                  }
              },
              yAxis:{
                lineWidth: 1,
                crosshair:true,
                title: {
                  text:'收益率'
                }
              },
              colors: ['#00A6ED', '#ff3e3e', '#52D1DC', '#FFB400', '#7FB800'],
              series:[{
                name:'沪深300',
                data:hsSy
              },{
                name:"账户收益率",
                data:userSy
              }]
          })
      }
    }
    
    //盈利分解模块处理
    $scope.qjylfjIndex = function(flag){
      $scope.ylfjIndex = flag;
      tql.home['用户区间收益查询']({
        'op_flag': 29,
        'order_field': 'profit',
        'order_flag': flag.toString(),
        'cond_json': '',
        'date_start':$scope.date.start.replace(/\-/g, ''),
        'date_end':$scope.date.end.replace(/\-/g, ''),
        '@POS':  0,
        '@COUNT': 5
      }, "JSONIX",true).then(function(res) {
          for(var i=0,j=0;i<res.list.length;i++){
            if(flag == 0){
              if(Number(res.list[i]['profit']) > 0){
                $scope.profits[j] = new Object();
                $scope.profits[j].name = res.list[i]['product_name'];
                $scope.profits[j].proMoney = res.list[i]['profit'];
                $scope.profits[j].rate_profit = res.list[i]['rate_profit']+'%';
                $scope.profits[j].hold_day = res.list[i]['hold_day'];
                if(j == 0){
                  $scope.profits[0].procent = "100%";
                }
                else{
                  $scope.profits[j].procent = (parseFloat(res.list[i]['profit'])/parseFloat(res.list[0]['profit'])*100).toFixed(2)+'%';
                }
                j++;
              }
            }
            else{
              if(Number(res.list[i]['profit']) < 0){
                $scope.profits[j] = new Object();
                $scope.profits[j].name = res.list[i]['product_name'];
                $scope.profits[j].proMoney = res.list[i]['profit'];
                $scope.profits[j].rate_profit = res.list[i]['rate_profit']+'%';
                $scope.profits[j].hold_day = res.list[i]['hold_day'];
                if(j == 0){
                  $scope.profits[0].procent = "100%";
                }
                else{
                  $scope.profits[j].procent = (parseFloat(res.list[i]['profit'])/parseFloat(res.list[0]['profit'])*100).toFixed(2)+'%';
                }
                j++;
              }
            }
          }
      }, function(err) {
        alert('盈利分解查询失败' + err);
      });
    }

    //资产分布处理
    $scope.zcfb = function(){
      tql.home['资金持仓查询']({
        'op_flag': 24,
        'date_start': $scope.date.end.replace(/\-/g, ''),
        'date_end': $scope.date.end.replace(/\-/g, ''),
        'order_field': '',
        'order_flag':'1',
        'cond_json': '',
        '@POS':  0,
        '@COUNT': -1
      }, "JSONIX",true).then(function (res) {
          var zcfbArr = new Array();
          for(var i in res.list){
            zcfbArr[i] = new Object();
            zcfbArr[i]['name'] = res.list[i]['zqlb_name'];
            zcfbArr[i]['y'] = parseFloat(res.list[i]['rate_asset']);
          }
          
          $('#zcfb').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: ''
            },
            legend:{
              align:'right',
              verticalAlign: 'middle',
              layout:'vertical'
            },
            credits: {
              enabled: false
            },
            colors: ['#ff3e3e','#52D1DC', '#00A6ED',  '#FFB400', '#7FB800'],
            tooltip: {
              pointFormat: "{series.name}: <b>{point.y}</b><br/>",
              valueSuffix: " %",
              shared: true
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            series: [{
                type: 'pie',
                name: '资产分布',
                data: zcfbArr
            }]
          })
      }, function (reason) {
        $scope.loadstate = '查询失败';
        $scope.errorinof = reason;
      });
    }

    $scope.sybdData = {
      sybdText : '',
      aWidth : ($('#sybd').width()/2-83)+'px',
      bWidth : ($('#sybd').width()/2-28)+'px',
      transrorm: 0
    }

    //收益波动
    $scope.sybd = function(flag){
      $scope.sybdIndex = flag;
      var __syzsFlag = [2, 3, 4];
      tql.home['用户区间收益查询']({
        'op_flag': __syzsFlag[flag],
        'order_field': '',
        'order_flag':'1',
        'cond_json': {
          'exch_code':'SZSE',
          'market_code':'A',
          'product_code':'399300'
        },
        '@POS':  0,
        '@COUNT': -1
      }, "JSONIX",true).then(function(hsres) {
          
          var sybdlv = Number(hsres.list[0]['fluctuation_profit']);
          if(sybdlv < 16){
            $scope.sybdData.sybdText = '风平浪静组合收益风平浪静，涨跌幅波动极小';
          }
          else if(sybdlv >= 16 && sybdlv < 47){
            $scope.sybdData.sybdText = '浪花朵朵组合收益平稳如微风吹过的海面激起浪花朵朵，涨跌幅波动较小';
          }
          else if(sybdlv >= 47 &&　sybdlv < 80){
            $scope.sybdData.sybdText = '波涛汹涌组合收益波涛汹涌，涨跌幅波动较大';
          }
          else if(sybdlv >= 80){
            $scope.sybdData.sybdText = '惊涛骇浪组合收益波动惊涛骇浪，涨跌幅波动极大';
            sybdlv = 180;
          }
          $scope.sybdData.transrorm = sybdlv;

      }, function(err) {
        alert('收益走势查询失败' + err);
      });
    }

    //人均换手
    $scope.rjhsData = {
      perDay: "",
      hsv: ""
    }
 
    $scope.rjhs = function(flag){
      $scope.rjhsIndex = flag;
      var __syzsFlag = [2, 3, 4];
      tql.home['用户区间收益查询']({
        'op_flag': __syzsFlag[flag],
        'order_field': '',
        'order_flag':'1',
        'cond_json': {
          'exch_code':'SZSE',
          'market_code':'A',
          'product_code':'399300'
        },
        '@POS':  0,
        '@COUNT': -1
      }, "JSONIX",true).then(function(hsres) {

          //给日均换手率  日均波动率绘图
           $scope.rjhsData.hsv = Number(hsres.list[0]['avg_turnover']);


           $scope.rjhsData.perDay = ($scope.rjhsData.hsv!=0) ?  parseInt(100/$scope.rjhsData.hsv) : 0;

      }, function(err) {
        alert('换手率查询失败' + err);
      });
    }

    //首页界面初始化
    $scope.getZhxx();
    $scope.getQjsy();
    $scope.dealQjsy(0);
    $scope.qjylfjIndex(0);
    $scope.zcfb();
    $scope.sybd(0);
    $scope.rjhs(0);
    // 查询点击
    $scope.cx = function() {
      var $date = $('.nav li input[type="text"]');
      $scope.date.start = $date.eq(0).val();
      $scope.date.end = $date.eq(1).val();
      $scope.getZhxx();
      $scope.getQjsy();
      $scope.dealQjsy(0);
      $scope.qjylfjIndex(0);
      $scope.zcfb();
      $scope.sybd(0);
      $scope.rjhs(0);
    };

    $(window).resize(function(){
      location.reload();
    })
  }
]);