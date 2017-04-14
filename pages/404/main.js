/*global angular, app*/

app.controller('notFoundController', ['$scope', '$location', function ($scope, $location) {
  $scope.path = $location.$$path;
  $scope.url = $location.$$absUrl;
  $scope.debug = false;
  $scope.toggleDebug = function () {
    $scope.debug = !$scope.debug;
  };
}]);