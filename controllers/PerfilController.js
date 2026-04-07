app.controller("PerfilController", function ($scope, $location, AuthService) {
  function getBackendMessage(error) {
    return error && error.data && (error.data.message || error.data.error)
      ? error.data.message || error.data.error
      : "";
  }

  function buildChangePasswordErrorMessage(error) {
    var backendMessage = getBackendMessage(error);

    if (backendMessage) {
      return backendMessage;
    }

    return "No fue posible actualizar la contrasena en este momento.";
  }

  $scope.passwordData = {
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  };
  $scope.changePasswordErrorMessage = "";
  $scope.changePasswordSuccessMessage = "";
  $scope.isSubmittingPassword = false;

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

  $scope.getSessionUserEmail = function () {
    return AuthService.getSessionUserEmail();
  };

  $scope.getSessionUserType = function () {
    return AuthService.getSessionUserType();
  };

  $scope.getSessionUserTypeLabel = function () {
    return AuthService.getSessionUserTypeLabel();
  };

  $scope.canViewMisPostulaciones = function () {
    return AuthService.canViewMisPostulaciones();
  };

  $scope.canViewMisOportunidades = function () {
    return AuthService.canViewMisOportunidades();
  };

  $scope.getPrimaryDestination = function () {
    if (AuthService.canViewMisPostulaciones()) {
      return {
        href: "mis-postulaciones",
        label: "Ir a mis postulaciones",
      };
    }

    if (AuthService.canViewMisOportunidades()) {
      return {
        href: "mis-oportunidades",
        label: "Ir a mis oportunidades",
      };
    }

    return {
      href: "home",
      label: "Volver al inicio",
    };
  };

  $scope.getPrimaryDestinationLabel = function () {
    return $scope.getPrimaryDestination().label;
  };

  $scope.goToPrimaryDestination = function () {
    $location.path(
      $scope.getPrimaryDestination().href === "mis-postulaciones"
        ? "/mis-postulaciones"
        : $scope.getPrimaryDestination().href === "mis-oportunidades"
          ? "/mis-oportunidades"
          : "/"
    );
  };

  $scope.changePassword = function () {
    if (!AuthService.hasSession()) {
      $location.path("/auth/login");
      return;
    }

    if (
      !$scope.passwordData.currentPassword ||
      !$scope.passwordData.newPassword ||
      !$scope.passwordData.confirmNewPassword
    ) {
      $scope.changePasswordErrorMessage = "Debes completar los tres campos.";
      return;
    }

    if ($scope.passwordData.newPassword !== $scope.passwordData.confirmNewPassword) {
      $scope.changePasswordErrorMessage = "La nueva contrasena y su confirmacion no coinciden.";
      return;
    }

    $scope.changePasswordErrorMessage = "";
    $scope.changePasswordSuccessMessage = "";
    $scope.isSubmittingPassword = true;

    AuthService.changePassword(
      $scope.passwordData.currentPassword,
      $scope.passwordData.newPassword
    ).then(
      function (response) {
        $scope.changePasswordSuccessMessage =
          (response.data && response.data.message) ||
          "Contrasena actualizada correctamente.";
        $scope.passwordData = {
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        };
      },
      function (error) {
        $scope.changePasswordErrorMessage =
          buildChangePasswordErrorMessage(error);
      }
    ).finally(function () {
      $scope.isSubmittingPassword = false;
    });
  };

  AuthService.restoreSession()
    .then(function () {
      if (!AuthService.hasSession()) {
        $location.path("/auth/login");
      }
    })
    .catch(function (error) {
      console.log("No se pudo reconstruir la sesion actual.", error);
      $location.path("/auth/login");
    });
});
