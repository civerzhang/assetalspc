/**
 * Created by Administrator on 2017/1/10.
 */

app.controller('zcpzController', function ($scope,tql,selfac) {
	//初始化日期控件
	$(".form_datetime").datetimepicker({
		language: 'zh-CN',
		format: 'yyyy-mm-dd',
		autoclose: true, // 选择日期后关闭
		todayBtn: true, // 显示today标签
		minView: 2, // 时间选择精度精确到天
		todayHighlight: true // 当前日期高亮显示
	});

  $scope.head = ["类型","证券代码","证券名称","涨幅(%)","收盘价","当前持仓","持仓市值","盈亏成本价","区间盈亏","盈亏率%",'仓位%'];
  $scope.zcpzData = [];
  $scope.date = {
      start: selfac["dateFormat"](-90, 'Y-M-D'),
      end: selfac["dateFormat"]('', 'Y-M-D')
  };

  $scope.clickNum = new Array();
  //定义画表格和画图函数
  $scope.zcpzFun = function() {
    //绘制表格
    tql.home['用户区间收益查询']({
      'op_flag': 29,
      'order_field': 'zqlb_name',
      'order_flag':'0',
      'date_start': $scope.date.start.replace(/\-/g, ''),
      'date_end': $scope.date.end.replace(/\-/g, ''),
      'cond_json': '{\"open_qty!\":0}',
      '@POS':  0,
      '@COUNT': -1
    }, "JSONIX",true).then(function(res) {
        if(res.list){
          $scope.zcpzData = [];
          var group = res.list[0]['zqlb_name'];
          var allopen_qty=0,allasset=0,allprofit=0;
          var j = 0 , s = 0,m=0;//s标记group那一行,l标记持仓里面一共有几种类型

          for(var i=0;i<res.list.length;i++){
            var newGroup = res.list[i]['zqlb_name'];
            $scope.zcpzData[j] = new Object();
            $scope.zcpzData[j] = {
              type:'',
              icon:'',
              show:'',
              data:[]
            }

            if(newGroup != group || j==0){
              s = j;
              group = newGroup;
              m++;
              $scope.clickNum.push(m);
              $scope.zcpzData[j].type = m;
              $scope.zcpzData[j].icon = (m==1 ?'fa fa-minus' : 'fa fa-plus');
              $scope.zcpzData[j].show =  true;
              $scope.zcpzData[j].data[0] = res.list[i]['zqlb_name'];
              $scope.zcpzData[j].data[5] = 0;
              $scope.zcpzData[j].data[6] = 0;
              $scope.zcpzData[j].data[8] = 0;
              i--;
            }
            else{
              //统计所有
              allprofit+=parseFloat(res.list[i]['profit']);
              allasset+=parseFloat(res.list[i]['asset']);
              allopen_qty+=parseInt(res.list[i]['open_qty']);
              $scope.zcpzData[j].type = m;
              $scope.zcpzData[j].icon = '';
              $scope.zcpzData[j].show = (m == 1 ? true : false);
              $scope.zcpzData[j].data[0] = '';
              $scope.zcpzData[j].data[2] = res.list[i]['product_name'];
              $scope.zcpzData[j].data[1] = res.list[i]['product_code'];
              $scope.zcpzData[j].data[3] = res.list[i]['rate_close_price'];
              $scope.zcpzData[j].data[4] = res.list[i]['close_price'];
              $scope.zcpzData[j].data[5] = parseInt(res.list[i]['open_qty']);
              $scope.zcpzData[j].data[6] = parseFloat(res.list[i]['asset']);
              $scope.zcpzData[j].data[7] = res.list[i]['profit_price'];
              $scope.zcpzData[j].data[8] = parseFloat(res.list[i]['profit']);
              $scope.zcpzData[j].data[9] = res.list[i]['rate_profit'];
              $scope.zcpzData[s].data[5] += parseInt(res.list[i]['open_qty']);
              $scope.zcpzData[s].data[6] += parseFloat(res.list[i]['asset']);
              $scope.zcpzData[s].data[8] += parseFloat(res.list[i]['profit']);
            }

            j++;
          }
          //现金
          var nowMoney = {
            type:0,
            icon:'',
            show:true,
            data:['现金','','','','','',res.list[0]['open_bal'],'','','','']
          };
          //全部
          var last = {
            type:0,
            icon:'',
            show:true,
            data:['全部','','','','',allopen_qty,(allasset+parseFloat(res.list[0]['open_bal'])),'',allprofit.toFixed(2),'','']
          };

          $scope.zcpzData.push(nowMoney);
          $scope.zcpzData.push(last);

          for(var i=0;i<$scope.zcpzData.length;i++){
              $scope.zcpzData[i].data[5] = selfac["numberFormat"]($scope.zcpzData[i].data[5]);
              $scope.zcpzData[i].data[8] = $scope.zcpzData[i].data[8];
              $scope.zcpzData[i].data[10] = ($scope.zcpzData[i].data[6]/last.data[6]*100).toFixed(2)+'%';
              $scope.zcpzData[i].data[6] = selfac["numberFormat"]($scope.zcpzData[i].data[6]);
          }
        }
    }, function(err) {
      alert('收益走势查询失败' + err);
    });
  }

  function strToNum(str){
    var num = Number((parseFloat(str)/10000).toFixed(2));
    return num;
  }

  $scope.zcpzHigh = function(){
      //绘制highchart
    tql.home['资金持仓查询']({
      'op_flag': 24,
      'order_field': '',
      'order_flag':'0',
      'date_start': $scope.date.start.replace(/\-/g, ''),
      'date_end': $scope.date.end.replace(/\-/g, ''),
      'cond_json': '',
      '@POS':  0,
      '@COUNT': -1
    }, "JSONIX",true).then(function(res) {
        if(res.list){
          var xAx = new Array(),yAx = new Array();
          xAx[0] = res.list[0]['bal_date'];
          var stockType = [res.list[0]['zqlb_name']];
          yAx[0] = {
            name:res.list[0]['zqlb_name'],
            data:[strToNum(res.list[0]['asset'])]
          }

          for(var s=1;s<res.list.length;s++){
            if(stockType.indexOf(res.list[s].zqlb_name) == -1){
              stockType.push(res.list[s].zqlb_name);
              var zclbIndex = stockType.indexOf(res.list[s].zqlb_name);
              yAx[zclbIndex] = new Object();
              yAx[zclbIndex].data = new Array();
            }

            if(xAx.indexOf(res.list[s]['bal_date']) == -1){
              xAx.push(res.list[s]['bal_date']);
            }
          }

          for(var m=0;m<res.list.length;m++){
              var zclbIndex = stockType.indexOf(res.list[m]['zqlb_name']);
              var dateIndex = xAx.indexOf(res.list[m]['bal_date']);
              yAx[zclbIndex].name = res.list[m]['zqlb_name'];
              yAx[zclbIndex].data[dateIndex] = strToNum(res.list[m]['asset']);
          }

      
          for(var j=0;j<yAx.length;j++){
            for(var jIndex=0;jIndex<yAx[j].data.length;jIndex++){
              var undData = yAx[j].data[jIndex];
              if(undData == undefined){
                yAx[j].data[jIndex] = 0;
              }
            }
            if(j == yAx.length-1){
              //highcharts处理数据  画图
              $('#zcpz_curve').highcharts({
                  chart:{
                    type:'area'
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
                    categories:xAx,
                    crosshair:true,
                    tickInterval: parseInt((xAx.length-1)/12)
                  },
                  plotOptions: {
                      series: {
                          marker: {
                              enabled: false
                          }
                      },
                      area: {
                          stacking: 'normal',
                          lineColor: '#666666',
                          lineWidth: 1,
                          marker: {
                              lineWidth: 1,
                              lineColor: '#666666'
                          }
                      }
                  },
                  tooltip: {
                    split: true,
                    shared: true
                  },
                  credits: {
                    enabled: false
                  },
                  yAxis:{
                    lineWidth: 1,
                    crosshair:true,
                    title: {
                        text: '资产(万)'
                    }
                  },
                  series:yAx
              })
            }
          }
        }
    }, function(err) {
      alert('收益走势查询失败' + err);
    });
  }

  $scope.hideShowTd = function(flag){
    $scope.zcpzData[flag].icon = $scope.zcpzData[flag].icon == 'fa fa-plus' ? 'fa fa-minus' : 'fa fa-plus';

    var clickType = $scope.zcpzData[flag].type;

    for(var n in $scope.zcpzData){
      if(($scope.zcpzData[n].type == clickType) && ($scope.zcpzData[n].icon == '')){
          if($scope.zcpzData[flag].icon == 'fa fa-plus'){
           $scope.zcpzData[n].show = false;
          }
          else if($scope.zcpzData[flag].icon == 'fa fa-minus'){
            $scope.zcpzData[n].show = true;
          }
      }
    }
  }

  $scope.getColor = function(flag,index){
      var color = Number(flag);
      if(index == 1){
        color = 'nameOrange';
      }
      else if(index == 3 || index == 9 || index == 8) {
        if(color > 0){
          color = 'syRed';
        }
        else if(color == 0){
          color = 'syGray';
        }
        else if(color < 0){
          color = 'syGreen';
        }
        else {
          color = 'syBlack';
        }
      }
      else if(index == 0){
        color = 'syBlack';
      }
      return color;
  }

  $scope.cx = function(){
    var $date = $('.nav li input[type="text"]');
    $scope.date.start = $date.eq(0).val();
    $scope.date.end = $date.eq(1).val();

    $scope.zcpzFun();
    $scope.zcpzHigh();
  }
  //页面初始化
  $scope.zcpzFun();
  $scope.zcpzHigh();
});