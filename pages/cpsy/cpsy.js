/**
 * Created by Administrator on 2017/1/10.
 */

app.controller('cpsyController', function ($scope,tql,selfac) {
	$scope.yjjz = { 		// 业绩基准指标
		select: '沪深300',
		list: ['沪深300', '上证指数', '深证成指', '中小板指', '创业板指']
	}

	$scope.cpsy = { 		// 产品收益统计
		head: ['收益率','一个月内','三个月内','半年内','一年内','两年内'],
		body: [
			["账户收益", "1", "2", "3", "4", "5"],
			["沪深300", "1", "1", "3", "4", "5"],
			["相对收益", "1", "2", "3", "4", "5"],
			["年化平均回报", "1", "2", "3", "4", "5"],
			["年化平均超额回报", "1", "2", "3", "4", "5"],
			["最大涨幅(%)", "1", "2", "3", "4", "5"],
			["正收益天数", "1", "2", "3", "4", "5"],
			["最大跌幅(%)", "1", "2", "3", "4", "5"],
			["负收益天数", "1", "2", "3", "4", "5"],
			//["年化波动率(%)", "1", "2", "3", "4", "5"]
		]
	}

	$(".form_datetime").datetimepicker({
		language: 'zh-CN',
		format: 'yyyy-mm-dd',
		autoclose: true, // 选择日期后关闭
		todayBtn: true, // 显示today标签
		minView: 2, // 时间选择精度精确到天
		todayHighlight: true // 当前日期高亮显示
	});


	$scope.date = {
      start: selfac["dateFormat"](-90, 'Y-M-D'),
      end: selfac["dateFormat"]('', 'Y-M-D')
    }

	//处理收益走势图表
    $scope.cpsyF = function(flag){
      $scope.yjjz.select = $scope.yjjz.list[flag];
      //定义收益走势横坐标  日期,组合收益纵坐标和沪深300纵坐标
      var xaxisArray=new Array(),userSy=new Array(),hsSy=new Array();
      // 收益走势查询,先查询沪深300收益，然后查询用户收益
      var __syzsFlag = [
	      { 
	      	'exch_code':'SZSE',
	      	'market_code':'A',
	      	'product_code':'399300'
	      },
	      {
	      	'exch_code':'SSE',
	      	'market_code':'A',
	      	'product_code':'999999'
	      },
	      {
	      	'exch_code':'SZSE',
	      	'market_code':'A',
	      	'product_code':'399001'
	      },
	      {
	      	'exch_code':'SZSE',
	      	'market_code':'A',
	      	'product_code':'399005'
	      },
	      {
	      	'exch_code':'SZSE',
	      	'market_code':'A',
	      	'product_code':'399006'
	      },
      ];

      $scope.cpsy.body[1][0] = $scope.yjjz.select;
      //画表格
      tql.home['用户区间收益查询']({
        'op_flag': 51,
        'order_field': '',
        'order_flag':'1',
        'cond_json': __syzsFlag[flag],
        '@POS':  0,
        '@COUNT': -1
      }, "JSONIX",true).then(function(res) {
      	  if(res.list.length){
      	  	for(var i=0;i<res.list.length;i++){
	    	  $scope.cpsy.head[i+1] = res.list[i]['data_type_name'];
	    	  $scope.cpsy.body[0][i+1] = res.list[i]['rate_profit'];
	    	  $scope.cpsy.body[1][i+1] = res.list[i]['rate_profit_index'];
	    	  $scope.cpsy.body[2][i+1] = res.list[i]['rate_profit_relative'];
	    	  $scope.cpsy.body[3][i+1] = res.list[i]['profit_avg_year'];
	    	  $scope.cpsy.body[4][i+1] = res.list[i]['profit_avg_year_relative'];
	    	  $scope.cpsy.body[5][i+1] = res.list[i]['rate_profit_max'];
	    	  $scope.cpsy.body[6][i+1] = res.list[i]['have_profit_day'];
	    	  $scope.cpsy.body[7][i+1] = res.list[i]['rate_profit_min'];
	    	  $scope.cpsy.body[8][i+1] = res.list[i]['no_profit_day'];
		    }
      	  }
      }, function(err) {
        alert('收益走势查询失败' + err);
      });

      //画走势图
      tql.home['用户区间收益查询']({
        'op_flag': 9,
        'order_field': '',
        'order_flag':'1',
        'date_start':$scope.date.start.replace(/\-/g, ''),
        'date_end':$scope.date.end.replace(/\-/g, ''),
        'cond_json': __syzsFlag[flag],
        '@POS':  0,
        '@COUNT': -1
      }, "JSONIX",true).then(function(hsres) {

  		  var compareStr = 	'rate_profit_'+__syzsFlag[flag].exch_code+'_'+__syzsFlag[flag].market_code+'_'+__syzsFlag[flag].product_code;
      	  for(var j in hsres.list){
      	  	xaxisArray[j] = hsres.list[j]['bal_date'];
            hsSy[j] = parseFloat(hsres.list[j][compareStr]);
      	  }

      	  tql.home['用户区间收益查询']({
            'op_flag': 9,
	        'order_field': '',
	        'order_flag':'1',
	        'date_start':$scope.date.start.replace(/\-/g, ''),
	        'date_end':$scope.date.end.replace(/\-/g, ''),
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

          //定义画图函数
	      var chart = function(){
	          //highcharts处理数据  画图
	          $('#cpsy_curve').highcharts({
	              chart:{
	                type:'spline'
	              },
	              title:{
	                text:'收益走势',
	                align:'left'
	              },
	              credits: {
            		enabled: false
        	      },
	              legend: {
	                align: 'center',
	                verticalAlign: 'top',
	                borderWidth: 0,
	              },
	              plotOptions: {
	                  series: {
	                      marker: {
	                          enabled: false
	                      }
	                  }
	              },
	              colors: ['#00A6ED', '#ff3e3e', '#52D1DC', '#FFB400', '#7FB800'],
	              xAxis:{
	                categories:xaxisArray,
	                crosshair:true,
	                //minTickInterval:6,
	                tickInterval: parseInt((xaxisArray.length-1)/10)
	              },
	              tooltip: {
                     shared: true
              	  },
	              yAxis:{
	                lineWidth: 1,
	                crosshair:true,
	                title:{
	                	text:'收益率'
	                }
	              },
	              series:[{
	                name:$scope.yjjz.select,
	                data:hsSy
	              },{
	                name:"账户收益率",
	                data:userSy
	              }]
	          })
	      }
      	  
      }, function(err) {
        alert('收益走势查询失败' + err);
      });
    }

    $scope.getColor = function(flag){
    	  var color = Number(flag);
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
	      return color;
    }

    $scope.cx = function() {
    	var $date = $('.nav li input[type="text"]');
        $scope.date.start = $date.eq(0).val();
        $scope.date.end = $date.eq(1).val();
    	var flag = $scope.yjjz.list.indexOf($scope.yjjz.select);
    	$scope.cpsyF(flag);
    }
  
    //页面初始化
    $scope.cpsyF(0);
});



