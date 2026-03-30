app.controller("VoluntariosController", function ($scope, VoluntariosService) {
  VoluntariosService.getVoluntarios().then(function (response) {
    $scope.voluntarios = response.data;
  });

  $scope.addVoluntario = function () {
    var nuevoVoluntario = {
      nombre: $scope.nuevoVoluntario.nombre,
      email: $scope.nuevoVoluntario.email,
    };
    VoluntariosService.createVoluntario(nuevoVoluntario).then(function (
      response
    ) {
      $scope.voluntarios.push(response.data);
      $scope.nuevoVoluntario = {};
    });
  };

  $scope.deleteVoluntario = function (id) {
    VoluntariosService.deleteVoluntario(id).then(function () {
      $scope.voluntarios = $scope.voluntarios.filter(function (voluntario) {
        return voluntario.id !== id;
      });
    });
  };
});
