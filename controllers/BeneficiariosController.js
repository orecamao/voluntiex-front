app.controller(
  "BeneficiariosController",
  function ($scope, BeneficiariosService) {
    BeneficiariosService.getBeneficiarios().then(function (response) {
      $scope.beneficiarios = response.data;
    });

    $scope.addBeneficiario = function () {
      var nuevoBeneficiario = {
        nombre: $scope.nuevoBeneficiario.nombre,
        email: $scope.nuevoBeneficiario.email,
      };
      BeneficiariosService.createBeneficiario(nuevoBeneficiario).then(function (
        response
      ) {
        $scope.beneficiarios.push(response.data);
        $scope.nuevoBeneficiario = {};
      });
    };

    $scope.deleteBeneficiario = function (id) {
      BeneficiariosService.deleteBeneficiario(id).then(function () {
        $scope.beneficiarios = $scope.beneficiarios.filter(function (
          beneficiario
        ) {
          return beneficiario.id !== id;
        });
      });
    };
  }
);
