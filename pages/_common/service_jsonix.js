/*global angular, app*/

/**
 * JSONIX的结构解析
 */
app.factory('JSONIX', function () {
  return {
    parse: function (IXJSON) {
      var ret = {};
      ret.errorCode = +IXJSON[0][0];
      ret.errorInfo = IXJSON[0][1];
      var titles = IXJSON[1];
      IXJSON.shift();
      IXJSON.shift();
      IXJSON.shift();

      ret.list = IXJSON.reduce(function (prev, curr) {
        // 将扁平数组转换为对象
        prev.push(curr.reduce(function (p, c, index) {
          p[titles[index]] = c;
          return p;
        }, {}));
        return prev;
      }, []);

      return ret;
    }
  };
});