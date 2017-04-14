/*global angular, app, window*/


/**
 * TQL请求的封装
 */
app.factory('tqlWrapper', function ($q, tdxSystemInterface, JSONIX) {
  // 初始化基础接口
  var calltql = null;
  var charset = 'GBK';
  var clientType = 'PC';

  var matches = /[?&]client_type=([a-zA-Z_0-9]+)/.exec(window.location.href);
  if (matches) {
    clientType = matches[1] || 'PC';
  }

  if (clientType === 'PC') {
    /***创建TS_client对象***/
    var tdxClientObj = window.CreateTDXClient({
      needReserve: false,
      needLogin: false,
      serverType: 'pccef',
      preLoginFuncList: [],
      notify: function (msgType, data, obj) {
      }
    });
    calltql = tdxClientObj.execute.bind(tdxClientObj);

  } else {
    /***创建TS_client对象***/
    var tdxClientObj = window.CreateTDXClient({
      needReserve: false,
      needLogin: false,
      preLoginFuncList: [],
      notify: function (msgType, data, obj) {
      }
    });
    calltql = tdxClientObj.execute.bind(tdxClientObj);
  }

  // 用于记录TQL请求的次数
  var totalCallTimes = 0;

  // promise wrap
  function wrap(entry, desc) {

    /**
     * 直接暴露出来的 TQL 接口，底层封装对上层透明
     * @param  {Object,String} data     上层调用送入的参数
     * @param  {String} backType 上层指定应答解析格式
     * @param  {Boolean} log      是否记录详细的TQL日志
     */
    return function (data, backType, log) {

      return $q(function (resolve, reject) {
        var callTimes = totalCallTimes++;
        var callBegin = +new Date();

        function onReject(err) {
          var log = '%cauto-error-log: %c[' + [entry, desc, err].join('] %c[') + ']';
          console.info(log, 'color: #C30062', 'color: #4A4A4A', 'color: #4A4A4A', 'color: red');
          reject(err);
        }

        function tqlCallback(err,raw) {
          var callEnd = +new Date();
          if (log) {
            console.log([
              '%c\nTQL(' + callTimes + ')请求详情, [' + entry + '][' + desc + ']',
              '%c请求结构：',
              '%c' + JSON.stringify(data, null, '  '),
              '%c应答结果：',
              '%c' + raw,
              '%c耗时：%c' + (callEnd - callBegin) + 'ms',
              ''
            ].join('\n'), 'color: green', 'color: blue', 'color: gray', 'color: blue', 'color: gray', 'color: blue', 'color: gray');
          }
          try {
            raw = JSON.parse(raw);
          } catch (ex) {
            err = raw;
          }

          if (err) {
            onReject(err);
          } else {
            if (backType === 'JSONIX') {
              var res = JSONIX.parse(raw);

              if (res.errorCode !== 0) {
                onReject(res.errorInfo);
              } else {
                resolve(res);
              }
            } else {
              resolve(raw);
            }
          }
        }

        if (typeof data !== 'string') {

          // tdxSystemInterface 两个入参的意义分别是：输入、日志标识
          tdxSystemInterface['获取用户信息'](null, true).then(function (res) {
            var info = res[0];
            /*data.cif_account = info['资金帐号'];
            data.op_id=data.cif_account;
            data.fund_acc_id=data.cif_account;*/

            //data.cif_account = data.fund_acc_id || info['资金帐号'];
            // data.cif_account = 'f001001001004292';
            // data.cif_account = 'f001001001013136';
            data.cif_account = 'f001001001010245';

            data.op_id= data.fund_acc_id || data.cif_account;
            
            //data.fund_acc_id= data.fund_acc_id || data.cif_account;
            // data.fund_acc_id = 'f001001001004292';
            // data.fund_acc_id = 'f001001001013136';
            data.fund_acc_id = 'f001001001010245';

            var stringData = JSON.stringify(data);
            calltql(entry, stringData, tqlCallback);
          }, onReject);
        } else {
          calltql(entry, data, tqlCallback);
        }
      });
    };
  }

  return wrap;
});

