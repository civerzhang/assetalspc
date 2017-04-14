/*global window, angular, app*/


/**
 * TQL的接口导出
 */
app.factory('tql', function (tqlWrapper) {
  var wrap = tqlWrapper;
  var exports = {};

  function reg(namespace, fnId, key, desc) {
    desc = desc || key;
    exports[namespace] = exports[namespace] || {};
    exports[namespace][key] = wrap(fnId, desc);
  }

  // 首页功能注册
  reg('home', 'tc.AAS:UserBalGet', '资金持仓查询');
  reg('home', 'tc.AAS:JourGet', '流水查询');
  reg('home', 'tc.AAS:UserRank', '用户收益排行查询');
  reg('home', 'tc.AAS:UserUpdate', '用户收益排行查询');
  reg('home', 'tc.AAS:UserGet', '用户信息查询');
  reg('home', 'tc.AAS.UserProfitGet', '用户区间收益查询');
  reg('zcpz', 'tc.AAS:UserBalGet', '资金持仓查询');

  return exports;
});