app.controller("HomeController", function ($scope, $controller, $location, AuthService) {
  $controller("OportunidadesController", {
    $scope: $scope,
  });

  $scope.logout = function () {
    AuthService.logout();
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

  $scope.getSessionUserTypeLabel = function () {
    return AuthService.getSessionUserTypeLabel();
  };

  $scope.canAddOportunidad = function () {
    return AuthService.canCreateOportunidad();
  };

  $scope.canViewMisPostulaciones = function () {
    return AuthService.canViewMisPostulaciones();
  };

  $scope.canViewMisOportunidades = function () {
    return AuthService.canViewMisOportunidades();
  };

  $scope.goToAddForm = function () {
    if (!$scope.isValidSession()) {
      $location.path("/auth/login");
      return;
    }

    if ($scope.canAddOportunidad()) {
      $location.path("/add-oportunidad");
    } else {
      $location.path("/");
    }
  };

  AuthService.restoreSession()
    .catch(function (error) {
      console.log("No se pudo reconstruir la sesion actual.", error);
    })
    .finally(function () {
      $scope.getOportunidades();
      $scope.cargarMisSolicitudes();
    });
});
