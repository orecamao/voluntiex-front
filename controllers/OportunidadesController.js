app.controller(
  "OportunidadesController",
  function ($scope, $location, OportunidadesService, AuthService) {
    $scope.filtro = {
      titulo: "",
      categoria: "",
      ubicacion: "",
      duracion: "",
      tipo: "",
      requisitos: "",
    };
    $scope.oportunidades = [];
    $scope.hasLoadedOportunidades = false;

    $scope.getFiltroOportunidades = function () {
      OportunidadesService.getFiltroOportunidades($scope.filtro).then(
        function (response) {
          $scope.oportunidades = response.data || [];
          $scope.hasLoadedOportunidades = true;
        },
        function (error) {
          $scope.hasLoadedOportunidades = true;
          console.log("Error al buscar oportunidades: ", error);
        }
      );
    };

    $scope.getOportunidades = function () {
      OportunidadesService.getOportunidades().then(function (response) {
        console.log("response.data", response.data);
        $scope.oportunidades = response.data || [];
        $scope.hasLoadedOportunidades = true;
      });
    };

    $scope.clearFiltros = function () {
      $scope.filtro = {
        titulo: "",
        categoria: "",
        ubicacion: "",
        duracion: "",
        tipo: "",
        requisitos: "",
      };

      $scope.getOportunidades();
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

    $scope.addOportunidad = function () {
      if ($scope.isValidSession()) {
        OportunidadesService.createOportunidad($scope.nuevaOportunidad).then(
          function (response) {
            console.log("Oportunidad agregada con exito", response);
            $location.path("/");
          },
          function (error) {
            console.error("Error al agregar oportunidad", error);
          }
        );
      } else {
        $location.path("/auth/login");
      }
    };

    $scope.goToOportunidadDetalle = function (id) {
      $location.path("/oportunidades/" + id);
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

    AuthService.restoreSession().catch(function (error) {
      console.log("No se pudo reconstruir la sesion actual.", error);
    });
  }
);
