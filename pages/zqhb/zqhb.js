/**
 * Created by Administrator on 2017/1/10.
 */

app.controller('zqhbController', function ($scope,tql,selfac) {
	// $scope.hblx = { 		// 回报类型
	// 	select: '绝对回报',
	// 	list: ['绝对回报', '周', '月', '年']
	// }

	$scope.yjjz = { 		// 业绩基准指标
		select: '沪深300',
		list: ['沪深300', '上证指数', '深证成指', '中小板指', '创业板指']
	}

	$scope.zqhbData = { 		// 产品收益统计
		head: ['年份','1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
		body: []
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

    var dealNum = function(str){
    	var num;
    	num = str[0] == 0 ? parseInt(str[1]) : parseInt(str);

    	return num;
    }

    $scope.zqhb = function(flag){
    	$scope.yjjz.select = $scope.yjjz.list[flag];
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

	    //画表格
	      tql.home['用户区间收益查询']({
	        'op_flag': 53,
	        'order_field': '',
	        'order_flag':'1',
	        'cond_json': __syzsFlag[flag],
	        'date_start':$scope.date.start.replace(/\-/g, ''),
        	'date_end':$scope.date.end.replace(/\-/g, ''),
	        '@POS':  0,
	        '@COUNT': -1
	      }, "JSONIX",true).then(function(res) {
	      	  if(res.list.length){
	      	  	//制表
	      	  	var dateObj = Number(res.list[0]['bal_date'].slice(0,4));
	      		$scope.zqhbData.body[0] = new Array();
	      		$scope.zqhbData.body[0][0] = dateObj;
	      		var j = 0;
	      	  	for(var i=0;i<res.list.length;i++){
	      	  		//获取2017 和 05
		    	  var newDateObj = Number(res.list[i]['bal_date'].slice(0,4));
		    	  var dateMon = res.list[i]['bal_date'].slice(4);
		    	  	//是新的一年就新建一个数组，否则添加到原来数组下面
		    	  if(newDateObj > dateObj){
		    	  	$scope.zqhbData.body[++j] = new Array();
		    	  	$scope.zqhbData.body[j][12] = 0;
		    	  	$scope.zqhbData.body[j][0] = newDateObj;
		    	  	$scope.zqhbData.body[j][dealNum(dateMon)] = parseFloat(res.list[i]['rate_profit']);
		    	  	dateObj = newDateObj;
		    	  }
		    	  else {
		    	  	$scope.zqhbData.body[j][dealNum(dateMon)] = parseFloat(res.list[i]['rate_profit']);
		    	  }
			    }

			    for(var m=0;m<$scope.zqhbData.body.length;m++){
			    	if($scope.zqhbData.body[m].length < 13){
			    		$scope.zqhbData.body[m].length = 13;
			    	}
			    	for(var n=0;n<$scope.zqhbData.body[m].length;n++){
			    		if($scope.zqhbData.body[m][n] == undefined){
			    			$scope.zqhbData.body[m][n] = 0;
			    		}
			    	}
			    } 
	      	  }

	      	  chart();

	      }, function(err) {
	        alert('收益走势查询失败' + err);
	      });

		    var chart = function(){
		    	//完成表格后画图
			    var xAx = $scope.zqhbData.head.slice(1);
			    var yAx = new Array();
			    for(var i in $scope.zqhbData.body){
			    	yAx[i] = new Object();
			    	yAx[i].name = $scope.zqhbData.body[i][0];
			    	yAx[i].data = $scope.zqhbData.body[i].slice(1);
			    }

		    	//highcharts处理数据  画图
		          $('#zqhb_curve').highcharts({
		              chart:{
		                type:'column'
		              },
		              title:{
		                text:'周期回报图',
		                align:'left'
		              },
		              legend: {
		                align: 'center',
		                verticalAlign: 'top',
		                borderWidth: 0,
		              },
		              credits: {
	            		enabled: false
	        	      },
	        	      colors: ['#ff3e3e', '#00A6ED', '#52D1DC', '#FFB400', '#7FB800'],
		              xAxis:{
		                categories:xAx,
		                crosshair:true
		              },
		              yAxis:{
		                lineWidth: 1,
		                crosshair:true,
		                title:{
	                	   text:'收益率'
	                	}
		              },
		              series:yAx
		          })
		    }
    }

    $scope.getColor = function(flag,index){
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

	      if(index == 0){
	      	color = 'syBlack';
	      }
	      return color;
    }

    $scope.cx = function(){
    	var $date = $('.nav li input[type="text"]');
      	$scope.date.start = $date.eq(0).val();
      	$scope.date.end = $date.eq(1).val();

      	var cxindex = $scope.yjjz.list.indexOf($scope.yjjz.select);
      	console.log(cxindex);
      	$scope.zqhb(cxindex);
    }
    //页面初始化
    $scope.zqhb(0);
});
