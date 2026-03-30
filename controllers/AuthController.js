app.controller("AuthController", function ($scope, $location, AuthService) {
  $scope.usuario = {
    email: "",
    password: "",
  };

  $scope.nuevoUsuario = {
    nombre: "",
    tipo: "",
    email: "",
    password: "",
    confirmPassword: "",
    rol: "Usuario",
  };

  $scope.isSubmitting = false;

  $scope.loginUsuario = function () {
    console.log("$scope.usuario: ", $scope.usuario);

    if (!$scope.usuario.email || !$scope.usuario.password) {
      alert("Por favor ingresa tus credenciales.");
      return;
    }

    AuthService.login($scope.usuario).then(
      function (response) {
        console.log("Login exitoso", response);

        $location.path("/");
      },
      function (error) {
        console.error("Error al iniciar sesión", error);
        alert("Error al iniciar sesión");
      }
    );
  };

  $scope.logout = function () {
    AuthService.logout();
    console.log("La sesión ha sido cerrada.");
    $location.path("/auth/login");
  };

  $scope.registrarUsuario = function () {
    console.log("$scope.nuevoUsuario: ", $scope.nuevoUsuario);

    if ($scope.isSubmitting) {
      return; 
    }

    $scope.isSubmitting = true; 

    if ($scope.nuevoUsuario.password === $scope.nuevoUsuario.confirmPassword) {
      AuthService.register($scope.nuevoUsuario).then(
        function (response) {
          console.log("Usuario registrado con éxito", response.data);

          $location.path("/auth/login");
        },
        function (error) {
          console.error("Error al registrar usuario:", error);
          alert("Error al registrar usuario");
        }
      );
    } else {
      alert("Las contraseñas no coinciden");
    }
  };
});
