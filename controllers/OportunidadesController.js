app.controller(
  "OportunidadesController",
  function ($scope, OportunidadesService, AuthService) {


    $scope.filtro = {
      titulo: "",
      categoria: "",
      ubicacion: "",
      duracion: "",
      tipo: "",
      requisitos: "",
    };

    $scope.getFiltroOportunidades = function () {
      OportunidadesService.getFiltroOportunidades($scope.filtro).then(
        function (response) {
          $scope.oportunidades = response.data;
        },
        function (error) {
          console.log("Error al buscar oportunidades: ", error);
        }
      );
    };
    $scope.getOportunidades = function () {
      OportunidadesService.getOportunidades().then(function (response) {
        console.log('response.data', response.data)
        if(response.data.length > 0) {
          $scope.oportunidades = response.data;
        }
      });
    };

    $scope.isValidSession = function () {
      var token = AuthService.getToken();
      console.log("token", token);
      return token ? true : false;
    };

    $scope.addOportunidad = function () {
      if ($scope.isValidSession()) {
        OportunidadesService.createOportunidad($scope.nuevaOportunidad).then(function (response) {
          console.log("Oportunidad agregada con éxito", response);
          $location.path('/');
        }, function (error) {
          console.error("Error al agregar oportunidad", error);
        });
      } else {
        $location.path('/auth/login');
      }
    };

    $scope.deleteOportunidad = function (id) {
      OportunidadesService.deleteOportunidad(id).then(function () {
        $scope.oportunidades = $scope.oportunidades.filter(function (
          oportunidad
        ) {
          return oportunidad.id !== id;
        });
      });
    };
  }
);
