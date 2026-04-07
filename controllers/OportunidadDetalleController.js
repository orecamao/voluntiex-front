app.controller(
  "OportunidadDetalleController",
  function ($scope, $stateParams, $location, OportunidadesService, AuthService) {
    $scope.oportunidad = null;
    $scope.isLoading = true;
    $scope.loadError = false;

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

    $scope.goBackHome = function () {
      $location.path("/");
    };

    $scope.hasBeneficiarios = function () {
      return (
        $scope.oportunidad &&
        Array.isArray($scope.oportunidad.beneficiarios) &&
        $scope.oportunidad.beneficiarios.length > 0
      );
    };

    $scope.loadOportunidad = function () {
      $scope.isLoading = true;
      $scope.loadError = false;

      OportunidadesService.getOportunidadById($stateParams.id).then(
        function (response) {
          $scope.oportunidad = response.data;
          $scope.isLoading = false;

          if (!$scope.oportunidad) {
            $scope.loadError = true;
          }
        },
        function (error) {
          console.error("Error al cargar la oportunidad", error);
          $scope.loadError = true;
          $scope.isLoading = false;
        }
      );
    };

    AuthService.restoreSession().catch(function (error) {
      console.log("No se pudo reconstruir la sesion actual.", error);
    });

    $scope.loadOportunidad();
  }
);
