app.controller(
  "OrganizacionesController",
  function ($scope, OrganizacionesService) {
    OrganizacionesService.getOrganizaciones().then(function (response) {
      $scope.organizaciones = response.data;
    });

    $scope.addOrganizacion = function () {
      var nuevaOrganizacion = {
        nombre: $scope.nuevaOrganizacion.nombre,
        mision: $scope.nuevaOrganizacion.mision,
      };
      OrganizacionesService.createOrganizacion(nuevaOrganizacion).then(
        function (response) {
          $scope.organizaciones.push(response.data);
          $scope.nuevaOrganizacion = {};
        }
      );
    };

    $scope.deleteOrganizacion = function (id) {
      OrganizacionesService.deleteOrganizacion(id).then(function () {
        $scope.organizaciones = $scope.organizaciones.filter(function (
          organizacion
        ) {
          return organizacion.id !== id;
        });
      });
    };
  }
);
