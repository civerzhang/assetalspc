//将路由注入进来
var app = angular.module('project-show', ['ngRoute']);

//配置路由
app.config(function ($routeProvider) {
  $routeProvider
    .when('/cpsy', {
      templateUrl: 'pages/cpsy/cpsy.html',
      controller: 'cpsyController'
    })
    .when('/hbtj', {
      templateUrl: 'pages/hbtj/hbtj.html',
      controller: 'hbtjController'
    })
    .when('/zqhb',{
      templateUrl:'pages/zqhb/zqhb.html',
      controller:'zqhbController'
    })
    .when('/zcpz',{
      templateUrl:'pages/zcpz/zcpz.html',
      controller:'zcpzController'
    }).when('/hypz',{
      templateUrl:'pages/hypz/hypz.html',
      controller:'hypzController'
    }).when('/cgtz',{
      templateUrl:'pages/cgtz/cgtz.html',
      controller:'cgtzController'
    }).when('/ylfj',{
      templateUrl:'pages/ylfj/ylfj.html',
      controller:'ylfjController'
    }).when('/jyhs',{
      templateUrl:'pages/jyhs/jyhs.html',
      controller:'jyhsController'
    }).when('/', {
      templateUrl: 'pages/home/home.html',
      controller: 'mainController'
    }).otherwise({
      controller: 'notFoundController',
      templateUrl: './pages/404/index.html'
    });
  ;
});

app.factory('selfac', function() {
  return {
    'voluation': function(obj, key, value, pos) {
      if(value) {
        // setter
        for(var i=0,len=obj.length; i<len; i++) {
          if(obj[i][0] === key) {
            if(pos) {
              obj[i][pos] = value;
            }
            else {
              obj[i][1] = value;
            }

            return obj;
          }
        }

        return false;
      }
      else {
        // getter
        for(var i=0,len=obj.length; i<len; i++) {
          if(obj[i][0] === key) {
            return obj[i][1];
          }
        }

        return false;
      }
    },
    'dateFormat': function(date, format) {
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
    },
    'numberFormat': function(str){
      var numberStr = Number(str);
      if(Math.abs(numberStr) >  100000000){
        numberStr = (numberStr/ 100000000).toFixed(2)+'亿';
      }
      else if(Math.abs(numberStr) > 10000){
        numberStr = (numberStr/ 10000).toFixed(2)+'万';
      }
      else{
        numberStr = numberStr.toFixed(2);
      }
      return numberStr;
    },
    'districtCode': function(flag){
      var ccycode = '人民币';
      if(flag == 'CNY'){
        ccycode = '人民币';
      }
      else if(flag == 'USD'){
        ccycode = '美元';
      }
      else if(flag == 'HKD'){
        ccycode = '港币';
      }
      else{
        ccycode = '人民币';
      }

      return ccycode;
    },
    'getColor': function(flag){
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
    },
  };
});

app.filter('numberFormat', function () {
  var titleCaseFilter = function (str,type,index) {
    var strType = type || 0;
    var numberStr;
    if(strType == 0){
      numberStr = parseFloat(str);
      if(Math.abs(numberStr) >  100000000){
        numberStr = (numberStr/ 100000000).toFixed(2)+'亿';
      }
      else if(Math.abs(numberStr) > 10000){
        numberStr = (numberStr/ 10000).toFixed(2)+'万';
      }
      else{
        numberStr = numberStr.toFixed(2);
      }
    }
    else if(strType == 1){
      numberStr = parseFloat(str);
      numberStr = numberStr + '%';
    }
    else if(strType == 4){
      if(index == 8){
        if(str != ''){
          numberStr = parseFloat(str);
          if(Math.abs(numberStr) >  100000000){
            numberStr = (numberStr/ 100000000).toFixed(2)+'亿';
          }
          else if(Math.abs(numberStr) > 10000){
            numberStr = (numberStr/ 10000).toFixed(2)+'万';
          }
          else{
            numberStr = numberStr.toFixed(2);
          }
        }
        else{
          numberStr = str;
        }
      }
      else if(index == 3){
        alert(str == '');
        if(str != ''){
          numberStr = parseFloat(str);
          numberStr = numberStr + '%';
        }
        else{
          numberStr = str;
        }
      }
      else{
        numberStr = str;
      }
    }
    else if(strType == 5){
      if(index == 4){
        if(str!= ''){
          numberStr = parseFloat(str);
          if(Math.abs(numberStr) >  100000000){
            numberStr = (numberStr/ 100000000).toFixed(2)+'亿';
          }
          else if(Math.abs(numberStr) > 10000){
            numberStr = (numberStr/ 10000).toFixed(2)+'万';
          }
          else{
            numberStr = numberStr.toFixed(2);
          }
        }
        else{
          numberStr = str;
        }
      }
      else{
        numberStr = str;
      }
    }

    return numberStr;
  };
  return titleCaseFilter;
});

app.directive('resize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        w.bind('resize', function () {
            scope.$apply();
        });
    }
}); 

app.controller('indexController', ['$scope', 'selfac', 'tql', 'tdxSystemInterface', function($scope, selfac, tql, tdxSystemInterface) {
  $scope.userinfo = [
    ["用户", "--"],
    ["券商", "--"],
    ["营业部", "--"],
    ["持仓市值", "--"],
    ["余额", "--"],
    ["总资产", "--"],
    ["融资负债", "--"],
    ["融券负债", "--"],
    ["质押负债", "--"],
    ["净资产", "--"]
  ];

  // 获取用户资料
  tdxSystemInterface['获取用户信息'](null, true).then(function (res) {
    var info = res[0];
    selfac["voluation"]($scope.userinfo, "用户", info["姓名"]);
    selfac["voluation"]($scope.userinfo, "营业部", info["营业部ID"]);
  }, function(err) {
    alert("用户资料获取失败!");
  });

  tql.home['资金持仓查询']({
    'op_flag': 1,
    'date_start': selfac["dateFormat"]('', 'YMD'),
    'date_end':selfac["dateFormat"]('', 'YMD'),
    'order_field': '',
    'order_flag':'1',
    'cond_json': '',
    '@POS':  0,
    '@COUNT': -1
  }, "JSONIX",true).then(function (res) {
    $scope.myholdlist = res.list;
    if ($scope.myholdlist.length > 0) {
      $scope.loadstate = '查询到数据';
      var info = $scope.myholdlist[0];

      // 展示接口数据
      selfac["voluation"]($scope.userinfo, "总资产", selfac["numberFormat"](info["asset"]));
      selfac["voluation"]($scope.userinfo, "余额", selfac["numberFormat"](info["open_bal"]));
      selfac["voluation"]($scope.userinfo, "持仓市值", selfac["numberFormat"](info["market_cap"]));
      selfac["voluation"]($scope.userinfo, "净资产", selfac["numberFormat"](info["asset"] - info["debt"]));
    } else {
      $scope.loadstate = '未查询到数据';
    }
  }, function (reason) {
    $scope.loadstate = '查询失败';
    $scope.errorinof = reason;
  });

  //定义公共的导出excel函数
  $scope.tableExcel = function(tableid){
    var idTmr; 
    function  getExplorer() {  
        var explorer = window.navigator.userAgent ;  
        //ie  
        if (explorer.indexOf("MSIE") >= 0) {  
            return 'ie';  
        }  
        //firefox  
        else if (explorer.indexOf("Firefox") >= 0) {  
            return 'Firefox';  
        }  
        //Chrome  
        else if(explorer.indexOf("Chrome") >= 0){  
            return 'Chrome';  
        }  
        //Opera  
        else if(explorer.indexOf("Opera") >= 0){  
            return 'Opera';  
        }  
        //Safari  
        else if(explorer.indexOf("Safari") >= 0){  
            return 'Safari';  
        }  
    }  
    function table_to_eccel(id) {  
        if(getExplorer()=='ie')  
        {  
            var curTbl = document.getElementById(tableid);  
            var oXL = new ActiveXObject("Excel.Application");  
            var oWB = oXL.Workbooks.Add();  
            var xlsheet = oWB.Worksheets(1);  
            var sel = document.body.createTextRange();  
            sel.moveToElementText(curTbl);  
            sel.select();  
            sel.execCommand("Copy");  
            xlsheet.Paste();  
            oXL.Visible = true;  

            try {  
                var fname = oXL.Application.GetSaveAsFilename("Excel.xls", "Excel Spreadsheets (*.xls), *.xls");  
            } catch (e) {  
                print("Nested catch caught " + e);  
            } finally {  
                oWB.SaveAs(fname);  
                oWB.Close(savechanges = false);  
                oXL.Quit();  
                oXL = null;  
                idTmr = window.setInterval("Cleanup();", 1);  
            }  

        }  
        else  
        {  
            tableToExcel(tableid)  
        }  
    } 
    function Cleanup() {  
        window.clearInterval(idTmr);  
        CollectGarbage();  
    }  
    var tableToExcel = (function() {  
        var uri = 'data:application/vnd.ms-excel;base64,',  
                template = '<html><head><meta charset="UTF-8"></head><body><table>{table}</table></body></html>',  
                base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) },  
                format = function(s, c) {  
                    return s.replace(/{(\w+)}/g,  
                            function(m, p) { return c[p]; }) }  
        return function(table, name) {  
            if (!table.nodeType) table = document.getElementById(table)  
            var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}  
            window.location.href = uri + base64(format(template, ctx))  
        }  
    })()  
    table_to_eccel(tableid);
  }
  
}]);

