/**
 * Created by Administrator on 2017/1/10.
 */

app.controller('hypzController', function ($scope,tql,selfac) {
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

    //$scope.head = ['','分类','证券名称','证券代码','当前持仓市值','持仓盈亏','持仓比例','市盈率(TTM)','流通市值','总市值'];
    $scope.head = ['分类','证券代码','证券名称','当前持仓市值','持仓盈亏','持仓比例','市盈率(TTM)','总市值'];
    $scope.clickNum = new Array();
	$scope.hypzData = [];

    $scope.hypzFun = function(){
    	//绘制表格
	    tql.home['用户区间收益查询']({
	      'op_flag': 29,
	      'order_field': 'hycode_name',
	      'order_flag':'0',
	      'date_start': $scope.date.start.replace(/\-/g, ''),
	      'date_end': $scope.date.end.replace(/\-/g, ''),
	      'cond_json': '{\"open_qty!\":0}',
	      '@POS':  0,
	      '@COUNT': -1
	    }, "JSONIX",true).then(function(res) {
	        if(res.list){
	          $scope.hypzData = [];
	          var group = res.list[0]['hycode_name'];
	          var allopen_qty=0,allasset=0,allprofit=0;
	          var j = 0 , s = 0,m=0,go=0;//s标记group那一行,l标记持仓里面一共有几种类型

	          for(var i=0;i<res.list.length;i++){
	          	if(res.list[i]['hycode_name'] == ''){res.list[i]['hycode_name'] = '其他';}
	            var newGroup = res.list[i]['hycode_name'];
	            $scope.hypzData[j] = new Object();
	            $scope.hypzData[j] = {
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
	              $scope.hypzData[j].type = m;
	              $scope.hypzData[j].icon = (m==1 ?'fa fa-minus' : 'fa fa-plus');
	              $scope.hypzData[j].show = true;
	              $scope.hypzData[j].data[0] = res.list[i]['hycode_name'];
	              $scope.hypzData[j].data[3] = 0;
	              $scope.hypzData[j].data[4] = 0;
	              $scope.hypzData[j].data[5] = '';
	              $scope.hypzData[j].data[8] = 0;
	              $scope.hypzData[j].data[9] = '';
	              i--;
	            }
	            else{
	              //统计所有
	              allprofit+=parseFloat(res.list[i]['profit']);
	              allasset+=parseFloat(res.list[i]['asset']);
	              $scope.hypzData[j].type = m;
	              $scope.hypzData[j].icon = '';
	              $scope.hypzData[j].show = (m == 1 ? true : false);
	              $scope.hypzData[j].data[0] = '';
	              $scope.hypzData[j].data[2] = res.list[i]['product_name'];
	              $scope.hypzData[j].data[1] = res.list[i]['product_code'];
	              $scope.hypzData[j].data[3] = parseFloat(res.list[i]['asset']);
	              $scope.hypzData[j].data[4] = parseFloat(res.list[i]['profit']);
	              $scope.hypzData[j].data[5] = '';
	              $scope.hypzData[j].data[9] = res.list[i]['setcode'];

	              $scope.hypzData[s].data[3] += parseFloat(res.list[i]['asset']);
	              $scope.hypzData[s].data[4] += parseFloat(res.list[i]['profit']);
	            }

	            j++;
	          }
	          //现金
	          var nowMoney = {
	            type:0,
	            icon:'',
	            show:true,
	            data:['现金','','',parseFloat(res.list[0]['open_bal']),'','','','','','']
	          };
	          $scope.hypzData.push(nowMoney);
	          //全部
	          var last = {
	            type:0,
	            icon:'',
	            show:true,
	            data:['全部','','',(allasset+parseFloat(res.list[0]['open_bal'])),allprofit.toFixed(2),'','','','']
	          };
	          $scope.hypzData.push(last);
	          var stockArray = new Array();
	          for(var i=0;i<$scope.hypzData.length;i++){
	              $scope.hypzData[i].data[3] = $scope.hypzData[i].data[3].toFixed(2);
	              $scope.hypzData[i].data[5] = ($scope.hypzData[i].data[3]/last.data[3]*100).toFixed(2)+'%';
	              $scope.hypzData[i].data[3] = selfac["numberFormat"]($scope.hypzData[i].data[3]);
	         
	              //请求行情数据
	              if(!$scope.hypzData[j].icon){
              		var stockStr = {
	              		Code:$scope.hypzData[i].data[1],
	              		Setcode: $scope.hypzData[i].data[9]
	              	}; 

	              	stockArray.push(stockStr);
	              }
          		  
	              
              	    
	             if(stockArray.length == 20  || (i == $scope.hypzData.length-1)){
	             	  var jsonStr = {
			          	WantCol:['SYL','ZSZ'],
			          	Secu:stockArray
			          };

			            __hqCallTql.send('HQServ.CombHQ',JSON.stringify(jsonStr),function(hqdata){
			              	hqdata = JSON.parse(hqdata);
			              	go+=hqdata.List.length;
			              	for(var num in hqdata.List){
			              		for(var ss in $scope.hypzData){
			              			if($scope.hypzData[ss].data[2] == hqdata.List[num][2]){
			              				$scope.hypzData[ss].data[6] = Number(hqdata.List[num][4]);
			              				$scope.hypzData[ss].data[8] = Number(hqdata.List[num][3]);
			              			}
			              		}
			              	}	

			              	if(go == $scope.hypzData.length-2-$scope.hypzData[$scope.hypzData.length-3].type){
			              		//处理各行业总市值问题
						          var j=0;
						          var s = $scope.hypzData[j].type;
						          for(var i=0;i<$scope.hypzData.length;i++){
						          	if($scope.hypzData[i].type == s){
						          		$scope.hypzData[j].data[8] += $scope.hypzData[i].data[8];
						          	}
						          	else{
						          		j=i;
						          		s = $scope.hypzData[j].type;
						          	}
						          }

						          for(var i=0;i<$scope.hypzData.length;i++){
						          	$scope.hypzData[i].data[8] = selfac["numberFormat"]($scope.hypzData[i].data[8]);
						          }

						          
						          $scope.$apply();
			              	}

			            });

			            stockArray.length = 0;
	             }
	          }	 
	        }
	    }, function(err) {
	      //alert('收益走势查询失败' + err);
	    });
    }

    $scope.hypzHigh = function(){
      //绘制highchart
	    tql.home['资金持仓查询']({
	      'op_flag': 25,
	      'order_field': '',
	      'order_flag':'0',
	      'date_start': $scope.date.start.replace(/\-/g, ''),
	      'date_end': $scope.date.end.replace(/\-/g, ''),
	      'cond_json': '',
	      '@POS':  0,
	      '@COUNT': 500
	    }, "JSONIX",true).then(function(res) {
	        if(res.list){
	          var xAx = new Array(),yAx = new Array();
	          xAx[0] = res.list[0]['bal_date'];
	          var stockType = [res.list[0]['hycode_name']];
	          yAx[0] = {
	            name:res.list[0]['hycode_name'],
	            data:[parseFloat(res.list[0]['rate_asset'])]
	          }

	          for(var s=1;s<res.list.length;s++){
		            if(stockType.indexOf(res.list[s].hycode_name) == -1){
		              stockType.push(res.list[s].hycode_name);
		              var zclbIndex = stockType.indexOf(res.list[s].hycode_name);
	          		  yAx[zclbIndex] = new Object();
	          		  yAx[zclbIndex].data = new Array();
		            }

		            if(xAx.indexOf(res.list[s]['bal_date']) == -1){
		              xAx.push(res.list[s]['bal_date']);
		            }
	          }

	          for(var m=0;m<res.list.length;m++){
	              var zclbIndex = stockType.indexOf(res.list[m]['hycode_name']);
	              var dateIndex = xAx.indexOf(res.list[m]['bal_date']);
	              yAx[zclbIndex].name = res.list[m]['hycode_name'];
	              yAx[zclbIndex].data[dateIndex] = parseFloat(res.list[m]['rate_asset']);
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
		              $('#hypz_curve').highcharts({
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
		                  yAxis: {
		                    title: {
		                        text: '单位(万元)'
		                    }
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
		                  credits: {
		                    enabled: false
		                  },
		                  tooltip: {
			                shared: true
			              },
		                  yAxis:{
		                    lineWidth: 1,
		                    crosshair:true,
		                    title: {
		                        text: '仓位比(%)'
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
	    $scope.hypzData[flag].icon = $scope.hypzData[flag].icon == 'fa fa-plus' ? 'fa fa-minus' : 'fa fa-plus';

	    var clickType = $scope.hypzData[flag].type;

	    for(var n in $scope.hypzData){
	      if(($scope.hypzData[n].type == clickType) && ($scope.hypzData[n].icon == '')){
	          if($scope.hypzData[flag].icon == 'fa fa-plus'){
	           $scope.hypzData[n].show = false;
	          }
	          else if($scope.hypzData[flag].icon == 'fa fa-minus'){
	            $scope.hypzData[n].show = true;
	          }
	      }
	    }
	}

	$scope.getColor = function(flag,index){
	      var color = Number(flag);
	      if(index == 1){
	        color = 'nameOrange';
	      }
	      else if(index == 4) {
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

    	$scope.hypzFun();
    	$scope.hypzHigh();
    }


    //页面初始化
    $scope.hypzFun();
    $scope.hypzHigh();
});