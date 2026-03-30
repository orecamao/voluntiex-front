app.controller("HomeController", function ($scope, $controller, $location, AuthService) {
  $controller("OportunidadesController", {
    $scope: $scope,
  });

  $scope.logout = function () {
    AuthService.logout();
    console.log("La sesión ha sido cerrada.");
    $location.path("/");
  };

  $scope.isValidSession = function () {
    var token = AuthService.getToken();
    console.log("token", token);
    return token ? true : false;
  };

  $scope.goToAddForm = function () {
    console.log('$scope.isValidSession()', $scope.isValidSession())
    if ($scope.isValidSession()) {
      console.log('entra')
      $location.path('/add-oportunidad');
    } else {
      $location.path('/auth/login');
    }
  };

  var setup = function () {
    $scope.getOportunidades();
  };

  setup();
});
