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
    return AuthService.hasSession();
  };

  $scope.getSessionUserName = function () {
    return AuthService.getSessionUserName();
  };

  $scope.getSessionUserType = function () {
    return AuthService.getSessionUserType();
  };

  $scope.canAddOportunidad = function () {
    var userType = ($scope.getSessionUserType() || "").toLowerCase();

    return userType === "beneficiario" || userType === "organizaci\u00f3n";
  };

  $scope.goToAddForm = function () {
    console.log('$scope.isValidSession()', $scope.isValidSession())
    if (!$scope.isValidSession()) {
      $location.path('/auth/login');
      return;
    }

    if ($scope.canAddOportunidad()) {
      console.log('entra')
      $location.path('/add-oportunidad');
    } else {
      $location.path('/');
    }
  };

  var setup = function () {
    AuthService.restoreSession().catch(function (error) {
      console.log("No se pudo reconstruir la sesión actual.", error);
    });
    $scope.getOportunidades();
  };

  setup();
});
