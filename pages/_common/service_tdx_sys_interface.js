/*global window, angular, app*/

/**
 * 该模块用于解决系统提供的不可传递匿名函数的异步调用缺陷
 */
app.factory('tdxCallbackWrap', function () {
  var getUID = (function () {
    var id = 0;
    return function (type) {
      if (type === 'number') {
        return id++;
      }
      return ('0000000' + (id++).toString(36)).substr(-8);
    };
  }());

  return function (fn) {
    if (typeof fn !== 'function') {
      return fn;
    }

    var globalName = 'tdxSystemAnonymous$$' + getUID() + '$' + Math.random().toString(16).substr(3, 6);
    window[globalName] = function () {
      fn.apply(null, arguments);
      delete window[globalName];
    };
    return globalName;
  };
});


/**
 * 该模块基于 SYS_FUNCData 进行封装
 */
app.factory('tdxSystemInterface', function ($q, tdxCallbackWrap) {

  var systemInterface = window.TDXQuery;

  function wrap(funcID) {
    /**
     * 客户端扩展的功能型接口调用
     * @param  {Object} param     送入参数，可为空
     */
    return function (param, log) {
      return $q(function (resolve, reject) {

        systemInterface({
          request: JSON.stringify({
            "Method": "SYS_FUNCData",
            "FuncName": "",
            "Param": "6"
          }),
          onSuccess: function (raw) {
            if (log) {
              console.log([
                '%c\nSYS_FUNCData(' + funcID + ')请求详情',
                '%c应答结果：',
                '%c' + raw,
                ''
              ].join('\n'), 'color: #AD0EC8', 'color: blue', 'color: gray');
            }

            var jsonData = null;
            try {
              jsonData = JSON.parse(raw);
            } catch (ex) {
              jsonData = null;
            }
            if (!jsonData) {
              reject('应答为空，请检查。' + ex);
            } else {
              resolve(jsonData);
            }

          },
          onFailure: function (errCode, errInfo) {
            console.log([
              '%c\nSYS_FUNCData(' + funcID + ')请求详情',
              '%c应答结果：',
              '%c错误号：' + errCode,
              '%c错误信息：' + errInfo,
              ''
            ].join('\n'), 'color: #AD0EC8', 'color: blue', 'color: gray');

            reject('应答错误，请检查。' + errInfo);
          }
        });
      });
    }
  }
  return {
    '获取用户信息': wrap(6)
  };
});



