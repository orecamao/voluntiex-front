app.controller(
  "OportunidadesController",
  function (
    $scope,
    $location,
    OportunidadesService,
    SolicitudesService,
    AuthService
  ) {
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
    $scope.postulandoPorOportunidad = {};
    $scope.postulacionErrorPorOportunidad = {};
    $scope.postulacionExitosaPorOportunidad = {};
    $scope.solicitudPorOportunidad = {};

    function normalizeState(value) {
      return (value || "").toString().trim().toUpperCase();
    }

    function getBackendMessage(error) {
      return error && error.data && (error.data.message || error.data.error)
        ? error.data.message || error.data.error
        : "";
    }

    function buildPostulacionErrorMessage(error) {
      var backendMessage = getBackendMessage(error);

      if (backendMessage) {
        return backendMessage;
      }

      if (error && error.status === 400) {
        return "No fue posible registrar la postulacion.";
      }

      return "No fue posible registrar la postulacion en este momento.";
    }

    function setSolicitudForOpportunity(solicitud) {
      var oportunidadId =
        solicitud && solicitud.oportunidad ? Number(solicitud.oportunidad.id) : null;

      if (!oportunidadId) {
        return;
      }

      $scope.solicitudPorOportunidad[oportunidadId] = solicitud;
    }

    function clearPostulacionMessages(oportunidadId) {
      delete $scope.postulacionErrorPorOportunidad[oportunidadId];
      delete $scope.postulacionExitosaPorOportunidad[oportunidadId];
    }

    function resetSolicitudesMap() {
      $scope.solicitudPorOportunidad = {};
    }

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
      OportunidadesService.getOportunidades().then(
        function (response) {
          $scope.oportunidades = response.data || [];
          $scope.hasLoadedOportunidades = true;
        },
        function (error) {
          $scope.hasLoadedOportunidades = true;
          console.log("Error al cargar oportunidades: ", error);
        }
      );
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

    $scope.getSessionUserTypeLabel = function () {
      return AuthService.getSessionUserTypeLabel();
    };

    $scope.canViewMisPostulaciones = function () {
      return AuthService.canViewMisPostulaciones();
    };

    $scope.canViewMisOportunidades = function () {
      return AuthService.canViewMisOportunidades();
    };

    $scope.goToOportunidadDetalle = function (id) {
      $location.path("/oportunidades/" + id);
    };

    $scope.canPostularse = function (oportunidad) {
      var solicitud;

      if (!oportunidad) {
        return false;
      }

      solicitud = $scope.getSolicitudDeOportunidad(oportunidad.id);

      return (
        AuthService.canApplyToOpportunities() &&
        !AuthService.isOpportunityOwner(oportunidad) &&
        $scope.isOportunidadActiva(oportunidad) &&
        (!$scope.hasSolicitudRegistrada(oportunidad.id) ||
          !$scope.isSolicitudActiva(solicitud))
      );
    };

    $scope.getSolicitudDeOportunidad = function (oportunidadId) {
      return $scope.solicitudPorOportunidad[Number(oportunidadId)] || null;
    };

    $scope.isOportunidadActiva = function (oportunidad) {
      return normalizeState(oportunidad && oportunidad.estado) !== "CANCELADA";
    };

    $scope.isSolicitudActiva = function (solicitud) {
      var estado = normalizeState(solicitud && solicitud.estado);

      return estado === "PENDIENTE" || estado === "APROBADA";
    };

    $scope.canCancelarSolicitud = function (solicitud) {
      return $scope.isSolicitudActiva(solicitud);
    };

    $scope.getEstadoPostulacion = function (oportunidadId) {
      var solicitud = $scope.getSolicitudDeOportunidad(oportunidadId);

      return solicitud ? solicitud.estado : "";
    };

    $scope.hasSolicitudRegistrada = function (oportunidadId) {
      return !!$scope.getSolicitudDeOportunidad(oportunidadId);
    };

    $scope.hasPostulado = function (oportunidadId) {
      return $scope.isSolicitudActiva($scope.getSolicitudDeOportunidad(oportunidadId));
    };

    $scope.canRepostularse = function (oportunidadId) {
      var solicitud = $scope.getSolicitudDeOportunidad(oportunidadId);
      var estado = normalizeState(solicitud && solicitud.estado);

      return estado === "CANCELADA" || estado === "RECHAZADA";
    };

    $scope.cargarMisSolicitudes = function () {
      if (!AuthService.canViewMisPostulaciones()) {
        resetSolicitudesMap();
        return;
      }

      SolicitudesService.getMisSolicitudes().then(
        function (response) {
          var solicitudes = Array.isArray(response.data) ? response.data : [];
          var index;

          resetSolicitudesMap();

          for (index = 0; index < solicitudes.length; index += 1) {
            setSolicitudForOpportunity(solicitudes[index]);
          }
        },
        function (error) {
          console.log("No fue posible cargar las postulaciones del usuario.", error);
        }
      );
    };

    $scope.postularse = function (oportunidad) {
      var oportunidadId = angular.isObject(oportunidad)
        ? oportunidad.id
        : oportunidad;
      var solicitudAnterior = $scope.getSolicitudDeOportunidad(oportunidadId);
      var isReactivation = !!solicitudAnterior && !$scope.isSolicitudActiva(solicitudAnterior);

      if (!AuthService.hasSession()) {
        $location.path("/auth/login");
        return;
      }

      if (angular.isObject(oportunidad) && !$scope.isOportunidadActiva(oportunidad)) {
        $scope.postulacionErrorPorOportunidad[oportunidadId] =
          "Esta oportunidad ya no esta disponible para postulaciones.";
        return;
      }

      if (!AuthService.canApplyToOpportunities()) {
        $scope.postulacionErrorPorOportunidad[oportunidadId] =
          "Solo los voluntarios pueden postularse a oportunidades.";
        return;
      }

      if ($scope.hasPostulado(oportunidadId)) {
        $scope.postulacionExitosaPorOportunidad[oportunidadId] =
          "Ya tienes una postulacion registrada en esta oportunidad.";
        return;
      }

      clearPostulacionMessages(oportunidadId);
      $scope.postulandoPorOportunidad[oportunidadId] = true;

      SolicitudesService.postularse(oportunidadId).then(
        function (response) {
          setSolicitudForOpportunity(
            response.data || {
              oportunidad: {
                id: oportunidadId,
              },
              estado: "PENDIENTE",
            }
          );
          $scope.postulacionExitosaPorOportunidad[oportunidadId] =
            isReactivation
              ? "Postulacion reactivada con estado PENDIENTE."
              : "Postulacion enviada con estado PENDIENTE.";
        },
        function (error) {
          $scope.postulacionErrorPorOportunidad[oportunidadId] =
            buildPostulacionErrorMessage(error);
        }
      ).finally(function () {
        $scope.postulandoPorOportunidad[oportunidadId] = false;
      });
    };
  }
);
