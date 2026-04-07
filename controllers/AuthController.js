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

  function redirectIfAuthenticated() {
    if (AuthService.hasSession() && AuthService.getSessionUserName()) {
      $location.path("/");
      return true;
    }

    return false;
  }

  function restoreSession() {
    AuthService.restoreSession()
      .then(function () {
        redirectIfAuthenticated();
      })
      .catch(function (error) {
        console.log("No se pudo reconstruir la sesion actual.", error);
      });
  }

  $scope.loginUsuario = function () {
    if ($scope.isValidSession()) {
      $location.path("/");
      return;
    }

    if (!$scope.usuario.email || !$scope.usuario.password) {
      alert("Por favor ingresa tus credenciales.");
      return;
    }

    AuthService.login($scope.usuario).then(
      function () {
        $location.path("/");
      },
      function (error) {
        console.error("Error al iniciar sesion", error);
        alert("Error al iniciar sesion");
      }
    );
  };

  $scope.logout = function () {
    AuthService.logout();
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

  $scope.getSessionUserTypeLabel = function () {
    return AuthService.getSessionUserTypeLabel();
  };

  $scope.goToLogin = function () {
    $location.path("/auth/login");
  };

  $scope.registrarUsuario = function () {
    if ($scope.isValidSession()) {
      $location.path("/");
      return;
    }

    if ($scope.isSubmitting) {
      return;
    }

    $scope.isSubmitting = true;

    if ($scope.nuevoUsuario.password === $scope.nuevoUsuario.confirmPassword) {
      AuthService.register($scope.nuevoUsuario).then(
        function () {
          $scope.isSubmitting = false;
          $location.path("/auth/register-success");
        },
        function (error) {
          $scope.isSubmitting = false;
          console.error("Error al registrar usuario:", error);
          alert("Error al registrar usuario");
        }
      );
    } else {
      $scope.isSubmitting = false;
      alert("Las contrasenas no coinciden");
    }
  };

  if (!redirectIfAuthenticated()) {
    restoreSession();
  }
});
