app.controller(
  "MisOportunidadesController",
  function (
    $scope,
    $location,
    OportunidadesService,
    SolicitudesService,
    AuthService
  ) {
    function normalizeState(value) {
      return (value || "").toString().trim().toUpperCase();
    }

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

      return "No fue posible cargar tus oportunidades en este momento.";
    }

    function buildSolicitudesErrorMessage(error) {
      var backendMessage = getBackendMessage(error);

      if (backendMessage) {
        return backendMessage;
      }

      return "No fue posible trabajar con las postulaciones de esta oportunidad.";
    }

    function buildCancelOportunidadErrorMessage(error) {
      var backendMessage = getBackendMessage(error);

      if (backendMessage) {
        return backendMessage;
      }

      return "No fue posible cancelar la oportunidad en este momento.";
    }

    function decorateOportunidad(oportunidad) {
      oportunidad.solicitudes = [];
      oportunidad.isLoadingSolicitudes = false;
      oportunidad.solicitudesError = "";
      oportunidad.showSolicitudes = false;
      return oportunidad;
    }

    $scope.oportunidades = [];
    $scope.isLoadingOportunidades = true;
    $scope.loadErrorMessage = "";
    $scope.actionMessage = "";
    $scope.updatingSolicitudPorId = {};

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

    $scope.getSessionUserType = function () {
      return AuthService.getSessionUserType();
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

    $scope.isOportunidadActiva = function (oportunidad) {
      return normalizeState(oportunidad && oportunidad.estado) !== "CANCELADA";
    };

    $scope.canCancelOportunidad = function (oportunidad) {
      return AuthService.canViewMisOportunidades() && $scope.isOportunidadActiva(oportunidad);
    };

    $scope.canManageSolicitudEstado = function (oportunidad, solicitud) {
      return (
        $scope.isOportunidadActiva(oportunidad) &&
        normalizeState(solicitud && solicitud.estado) !== "CANCELADA"
      );
    };

    $scope.loadSolicitudes = function (oportunidad) {
      oportunidad.isLoadingSolicitudes = true;
      oportunidad.solicitudesError = "";

      SolicitudesService.getSolicitudesByOportunidad(oportunidad.id).then(
        function (response) {
          oportunidad.solicitudes = Array.isArray(response.data) ? response.data : [];
        },
        function (error) {
          console.error("Error al cargar postulaciones", error);
          oportunidad.solicitudesError = buildSolicitudesErrorMessage(error);
        }
      ).finally(function () {
        oportunidad.isLoadingSolicitudes = false;
      });
    };

    $scope.toggleSolicitudes = function (oportunidad) {
      oportunidad.showSolicitudes = !oportunidad.showSolicitudes;

      if (oportunidad.showSolicitudes) {
        $scope.loadSolicitudes(oportunidad);
      }
    };

    $scope.updateSolicitudEstado = function (oportunidad, solicitud, estado) {
      if (!$scope.canManageSolicitudEstado(oportunidad, solicitud)) {
        return;
      }

      oportunidad.solicitudesError = "";
      $scope.updatingSolicitudPorId[solicitud.id] = true;

      SolicitudesService.updateEstadoSolicitud(solicitud.id, estado).then(
        function (response) {
          var updatedSolicitud = response.data || angular.extend({}, solicitud, {
            estado: estado,
          });

          angular.extend(solicitud, updatedSolicitud);
          solicitud.estado = updatedSolicitud.estado || estado;
        },
        function (error) {
          oportunidad.solicitudesError = buildSolicitudesErrorMessage(error);
        }
      ).finally(function () {
        $scope.updatingSolicitudPorId[solicitud.id] = false;
      });
    };

    $scope.deleteOportunidad = function (oportunidad) {
      $scope.actionMessage = "";
      oportunidad.solicitudesError = "";

      OportunidadesService.deleteOportunidad(oportunidad.id).then(
        function (response) {
          $scope.oportunidades = $scope.oportunidades.filter(function (item) {
            return item.id !== oportunidad.id;
          });
          $scope.actionMessage =
            (response.data && response.data.message) ||
            "Oportunidad cancelada correctamente.";
        },
        function (error) {
          oportunidad.solicitudesError = buildCancelOportunidadErrorMessage(error);
        }
      );
    };

    $scope.loadMisOportunidades = function () {
      $scope.isLoadingOportunidades = true;
      $scope.loadErrorMessage = "";

      OportunidadesService.getMisOportunidades().then(
        function (response) {
          var oportunidades = Array.isArray(response.data) ? response.data : [];

          $scope.oportunidades = oportunidades.map(function (oportunidad) {
            return decorateOportunidad(oportunidad);
          });
        },
        function (error) {
          console.error("Error al cargar mis oportunidades", error);
          $scope.loadErrorMessage = buildLoadErrorMessage(error);
        }
      ).finally(function () {
        $scope.isLoadingOportunidades = false;
      });
    };

    AuthService.restoreSession()
      .then(function () {
        if (!AuthService.hasSession()) {
          $location.path("/auth/login");
          return;
        }

        if (!AuthService.canViewMisOportunidades()) {
          $location.path("/");
          return;
        }

        $scope.loadMisOportunidades();
      })
      .catch(function (error) {
        console.log("No se pudo reconstruir la sesion actual.", error);
        $location.path("/auth/login");
      });
  }
);
