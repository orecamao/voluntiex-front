app.controller(
  "MisPostulacionesController",
  function ($scope, $location, SolicitudesService, AuthService) {
    function getBackendMessage(error) {
      return error && error.data && (error.data.message || error.data.error)
        ? error.data.message || error.data.error
        : "";
    }

    function buildLoadErrorMessage(error) {
      var backendMessage = getBackendMessage(error);

      if (backendMessage) {
        return backendMessage;
      }

      return "No fue posible cargar tus postulaciones en este momento.";
    }

    function buildCancelErrorMessage(error) {
      var backendMessage = getBackendMessage(error);

      if (backendMessage) {
        return backendMessage;
      }

      return "No fue posible cancelar la postulacion en este momento.";
    }

    function normalizeState(value) {
      return (value || "").toString().trim().toUpperCase();
    }

    $scope.solicitudes = [];
    $scope.isLoadingSolicitudes = true;
    $scope.loadErrorMessage = "";
    $scope.actionMessage = "";
    $scope.actionErrorMessage = "";
    $scope.cancellingSolicitudPorId = {};

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

    $scope.getSessionUserTypeLabel = function () {
      return AuthService.getSessionUserTypeLabel();
    };

    $scope.canViewMisPostulaciones = function () {
      return AuthService.canViewMisPostulaciones();
    };

    $scope.canViewMisOportunidades = function () {
      return AuthService.canViewMisOportunidades();
    };

    $scope.getCreatorSummary = function (oportunidad) {
      var creatorType = oportunidad ? (oportunidad.tipoCreador || "").toLowerCase() : "";
      var creatorName = oportunidad
        ? oportunidad.nombreUsuario ||
          (oportunidad.organizacion && oportunidad.organizacion.nombre) ||
          (oportunidad.beneficiarioCreador &&
            oportunidad.beneficiarioCreador.nombre) ||
          "No disponible"
        : "No disponible";

      if (creatorType === "organizacion") {
        return "Creada por organizacion " + creatorName;
      }

      if (creatorType === "beneficiario") {
        return "Creada por beneficiario " + creatorName;
      }

      return "Creada por " + creatorName;
    };

    $scope.goToOportunidad = function (oportunidadId) {
      $location.path("/oportunidades/" + oportunidadId);
    };

    $scope.isSolicitudCancelable = function (solicitud) {
      var estado = normalizeState(solicitud && solicitud.estado);

      return estado === "PENDIENTE" || estado === "APROBADA";
    };

    $scope.isOportunidadCancelada = function (solicitud) {
      return normalizeState(
        solicitud && solicitud.oportunidad && solicitud.oportunidad.estado
      ) === "CANCELADA";
    };

    $scope.cancelarSolicitud = function (solicitud) {
      $scope.actionMessage = "";
      $scope.actionErrorMessage = "";
      $scope.cancellingSolicitudPorId[solicitud.id] = true;

      SolicitudesService.cancelarSolicitud(solicitud.id).then(
        function (response) {
          angular.extend(solicitud, response.data || { estado: "CANCELADA" });
          solicitud.estado = (response.data && response.data.estado) || "CANCELADA";
          $scope.actionMessage = "Postulacion cancelada correctamente.";
        },
        function (error) {
          console.error("Error al cancelar postulacion", {
            status: error && error.status,
            data: error && error.data,
            solicitudId: solicitud && solicitud.id,
            sessionUserType: AuthService.getSessionUserType(),
            hasToken: !!AuthService.getToken(),
          });
          $scope.actionErrorMessage = buildCancelErrorMessage(error);
        }
      ).finally(function () {
        $scope.cancellingSolicitudPorId[solicitud.id] = false;
      });
    };

    $scope.loadMisSolicitudes = function () {
      $scope.isLoadingSolicitudes = true;
      $scope.loadErrorMessage = "";

      SolicitudesService.getMisSolicitudes().then(
        function (response) {
          $scope.solicitudes = Array.isArray(response.data) ? response.data : [];
        },
        function (error) {
          console.error("Error al cargar mis postulaciones", error);
          $scope.loadErrorMessage = buildLoadErrorMessage(error);
        }
      ).finally(function () {
        $scope.isLoadingSolicitudes = false;
      });
    };

    AuthService.restoreSession()
      .then(function () {
        if (!AuthService.hasSession()) {
          $location.path("/auth/login");
          return;
        }

        if (!AuthService.canViewMisPostulaciones()) {
          $location.path("/");
          return;
        }

        $scope.loadMisSolicitudes();
      })
      .catch(function (error) {
        console.log("No se pudo reconstruir la sesion actual.", error);
        $location.path("/auth/login");
      });
  }
);
