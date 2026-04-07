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

  var redirectIfAuthenticated = function () {
    if (AuthService.hasSession() && AuthService.getSessionUserName()) {
      $location.path("/");
      return true;
    }

    return false;
  };

  var restoreSession = function () {
    AuthService.restoreSession()
      .then(function () {
        redirectIfAuthenticated();
      })
      .catch(function (error) {
        console.log("No se pudo reconstruir la sesi\u00f3n actual.", error);
      });
  };

  $scope.loginUsuario = function () {
    if ($scope.isValidSession()) {
      $location.path("/");
      return;
    }

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
        console.error("Error al iniciar sesi\u00f3n", error);
        alert("Error al iniciar sesi\u00f3n");
      }
    );
  };

  $scope.logout = function () {
    AuthService.logout();
    console.log("La sesi\u00f3n ha sido cerrada.");
    $location.path("/auth/login");
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

  $scope.registrarUsuario = function () {
    if ($scope.isValidSession()) {
      $location.path("/");
      return;
    }

    console.log("$scope.nuevoUsuario: ", $scope.nuevoUsuario);

    if ($scope.isSubmitting) {
      return;
    }

    $scope.isSubmitting = true;

    if ($scope.nuevoUsuario.password === $scope.nuevoUsuario.confirmPassword) {
      AuthService.register($scope.nuevoUsuario).then(
        function (response) {
          console.log("Usuario registrado con \u00e9xito", response.data);
          $location.path("/auth/login");
        },
        function (error) {
          console.error("Error al registrar usuario:", error);
          alert("Error al registrar usuario");
        }
      );
    } else {
      alert("Las contrase\u00f1as no coinciden");
    }
  };

  if (!redirectIfAuthenticated()) {
    restoreSession();
  }
});
