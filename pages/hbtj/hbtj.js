/**
 * Created by Administrator on 2017/1/10.
 */

app.controller('hbtjController', function ($scope,tql) {
	// $scope.tjzq = { 		// 统计周期
	// 	select: '日',
	// 	list: ['日', '周', '月', '年']
	// }

	// $scope.hblx = { 		// 回报类型
	// 	select: '绝对回报',
	// 	list: ['绝对回报', '相对回报']
	// }

	$scope.yjjz = { 		// 业绩基准
		select: '沪深300',
		list: ['沪深300', '上证指数', '深证成指', '中小板指', '创业板指']
	}

	$scope.hbtj = { 		// 回报统计列表数据
		head: ["", "上涨", "下跌", "合计", "", "回报率", "发生日期"],
		body: [
			["周期数", "1", "2", "3", "涨幅第一", "4", "5"],
			["百分比", "1", "2", "3", "涨幅第二", "4", "5"],
			["平均值", "1", "2", "3", "涨幅第三", "4", "5"],
			["标准偏差", "1", "2", "3", "跌幅第三", "4", "5"],
			["最大序列", "1", "2", "3", "跌幅第二", "4", "5"],
			["平均序列", "1", "2", "3", "跌幅第一", "4", "5"]
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

	// 时间格式化
	function dateFormat(date, format) {
		var now = new Date();
        var date = date || now;
        if(typeof date === 'number') {
          date = new Date(+now + date*24*60*60*1000);
        }
        var type = Object.prototype.toString.call(date).slice(8, -1).toLowerCase();
		if(type === "date") {
			if(format && typeof format === "string") {
				var year = ("0000" + date.getFullYear()).substr(-4);
				var month = ("00" + (date.getMonth()+1)).substr(-2);
				var day = ("00" + date.getDate()).substr(-2);
				var hour = ("00" + date.getHours()).substr(-2);
				var minute = ("00" + date.getMinutes()).substr(-2);
				var second = ("00" + date.getSeconds()).substr(-2);

				var result = format.replace(/y/ig, year)
									.replace(/M/g, month)
									.replace(/d/ig, day)
									.replace(/h/ig, hour)
									.replace(/m/g, minute)
									.replace(/s/ig, second);

				return result;
			}
			else {
				var year = ("0000" + date.getFullYear()).substr(-4);
				var month = ("00" + (date.getMonth()+1)).substr(-2);
				var day = ("00" + date.getDate()).substr(-2);
				return year + month + day;
			}
		}
		else 
			return "时间格式错误";
	}

	$scope.date = {
      start: dateFormat(-90, 'Y-M-D'),
      end: dateFormat('', 'Y-M-D')
    }

    $scope.hbtjFun = function(flag){
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
	        'op_flag': 52,
	        'order_field': '',
	        'order_flag':'0',
	        'cond_json': __syzsFlag[flag],
	        'date_start':$scope.date.start.replace(/\-/g, ''),
        	'date_end':$scope.date.end.replace(/\-/g, ''),
	        '@POS':  0,
	        '@COUNT': -1
	    }, "JSONIX",true).then(function(res) {
	      	if(res.list){	
	    	  $scope.hbtj.body[0][1] = res.list[0]['count_profit_p'];
	    	  $scope.hbtj.body[0][2] = res.list[0]['count_profit_n'];
	    	  $scope.hbtj.body[0][3] = res.list[0]['total_count'];
	    	  $scope.hbtj.body[1][1] = res.list[0]['count_rate_p'];
	    	  $scope.hbtj.body[1][2] = res.list[0]['count_rate_n'];
	    	  $scope.hbtj.body[1][3] = res.list[0]['total_rate'];
	    	  $scope.hbtj.body[2][1] = res.list[0]['avg_rate_profit_p'];
	    	  $scope.hbtj.body[2][2] = res.list[0]['avg_rate_profit_n'];
	    	  $scope.hbtj.body[2][3] = res.list[0]['total_avg_rate']; 
	    	  $scope.hbtj.body[3][1] = res.list[0]['deviation_profit_p'];
	    	  $scope.hbtj.body[3][2] = res.list[0]['deviation_profit_n'];
	    	  $scope.hbtj.body[3][3] = res.list[0]['total_deviation']; 
	    	  $scope.hbtj.body[4][1] = res.list[0]['seq_profit_p'];
	    	  $scope.hbtj.body[4][2] = res.list[0]['seq_profit_n'];
	    	  $scope.hbtj.body[4][3] = res.list[0]['total_seq'];  
	    	  $scope.hbtj.body[5][1] = res.list[0]['deviation_profit_p'];
	    	  $scope.hbtj.body[5][2] = res.list[0]['deviation_profit_n'];
	    	  $scope.hbtj.body[5][3] = res.list[0]['total_avg_seq'];   

	    	  for(var j in res.list){
	    	  	$scope.hbtj.body[j][5] = res.list[j]['rate_profit'];
	    	  	$scope.hbtj.body[j][6] = res.list[j]['bal_date'];
	    	  }

	      	}
	      }, function(err) {
	        alert('收益走势查询失败' + err);
	    });


	    var xAx = new Array();
	    var syl = new Array();
	    //画图
	    tql.home['资金持仓查询']({
	    	'op_flag': 1,
	        'order_field': '',
	        'order_flag':'1',
	        'cond_json': '',
	        'date_start':$scope.date.start.replace(/\-/g, ''),
        	'date_end':$scope.date.end.replace(/\-/g, ''),
	        '@POS':  0,
	        '@COUNT': -1
	    }, "JSONIX",true).then(function(res){
	    	if(res.list){
	    		for(var i in res.list){
	    			xAx[i] = res.list[i]['bal_date'];
	    			syl[i] = parseFloat(res.list[i]['rate_profit']);
	    		}
	    		chart();
	    	}
	    },function(err){
	    	alert('日收益查询失败' + err);
	    })

	    var chart = function(){
	    	//highcharts处理数据  画图
	          $('#hbtj_curve').highcharts({
	              chart:{
	                type:'column'
	              },
	              title:{
	                text:'回报统计图',
	                align:'left'
	              },
	              legend: {
	                align: 'center',
	                verticalAlign: 'top',
	                borderWidth: 0,
	              },
	              colors: ['#ff3e3e', '#00A6ED', '#52D1DC', '#FFB400', '#7FB800'],
	              credits: {
            		enabled: false
        	      },
	              xAxis:{
	                categories:xAx,
	                crosshair:true,
	                tickInterval: parseInt((xAx.length-1)/17)
	              },
	              yAxis:{
	                lineWidth: 1,
	                crosshair:true,
	                title:{
	                	text:'收益率'
	                }
	              },
	              series:[{
		            name: '收益率',
		            data: syl
			      }]
	          })
	    }
    }

    $scope.cx = function() {
    	var $date = $('.nav li input[type="text"]');
        $scope.date.start = $date.eq(0).val();
        $scope.date.end = $date.eq(1).val();
        var flag = $scope.yjjz.list.indexOf($scope.yjjz.select);
    	$scope.hbtjFun(flag);
    }

    //页面初始化
    $scope.hbtjFun(0);


});