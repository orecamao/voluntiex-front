app.controller(
  "OportunidadDetalleController",
  function (
    $scope,
    $stateParams,
    $location,
    OportunidadesService,
    SolicitudesService,
    AuthService
  ) {
    $scope.oportunidad = null;
    $scope.isLoading = true;
    $scope.loadError = false;
    $scope.loadErrorMessage = "";
    $scope.ownerSolicitudes = [];
    $scope.ownerSolicitudesError = "";
    $scope.ownerActionMessage = "";
    $scope.isLoadingOwnerSolicitudes = false;
    $scope.mySolicitud = null;
    $scope.isLoadingMySolicitud = false;
    $scope.postulacionErrorMessage = "";
    $scope.postulacionSuccessMessage = "";
    $scope.isSubmittingPostulacion = false;
    $scope.isCancellingPostulacion = false;
    $scope.isCancellingOportunidad = false;
    $scope.updatingSolicitudPorId = {};

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

    function buildCancelarPostulacionErrorMessage(error) {
      var backendMessage = getBackendMessage(error);

      if (backendMessage) {
        return backendMessage;
      }

      if (error && error.status === 400) {
        return "No fue posible cancelar la postulacion.";
      }

      return "No fue posible cancelar la postulacion en este momento.";
    }

    function buildOwnerSolicitudesErrorMessage(error) {
      var backendMessage = getBackendMessage(error);

      if (backendMessage) {
        return backendMessage;
      }

      if (error && error.status === 400) {
        return "La solicitud no pudo actualizarse.";
      }

      return "No fue posible cargar o actualizar las postulaciones de esta oportunidad.";
    }

    function buildCancelarOportunidadErrorMessage(error) {
      var backendMessage = getBackendMessage(error);

      if (backendMessage) {
        return backendMessage;
      }

      if (error && error.status === 400) {
        return "No fue posible cancelar la oportunidad.";
      }

      return "No fue posible cancelar la oportunidad en este momento.";
    }

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

    $scope.goBackHome = function () {
      $location.path("/");
    };

    $scope.isCurrentUserOwner = function () {
      return AuthService.isOpportunityOwner($scope.oportunidad);
    };

    $scope.canPostularse = function () {
      return (
        !!$scope.oportunidad &&
        AuthService.canApplyToOpportunities() &&
        !$scope.isCurrentUserOwner() &&
        $scope.isOportunidadActiva() &&
        !$scope.hasActiveMySolicitud()
      );
    };

    $scope.isOportunidadCancelada = function () {
      return normalizeState($scope.oportunidad && $scope.oportunidad.estado) === "CANCELADA";
    };

    $scope.isOportunidadActiva = function () {
      return !$scope.isOportunidadCancelada();
    };

    $scope.hasBeneficiarios = function () {
      return (
        $scope.oportunidad &&
        Array.isArray($scope.oportunidad.beneficiarios) &&
        $scope.oportunidad.beneficiarios.length > 0
      );
    };

    $scope.getCreatorSummary = function () {
      var creatorType;
      var creatorName;

      if (!$scope.oportunidad) {
        return "";
      }

      creatorType = ($scope.oportunidad.tipoCreador || "").toLowerCase();
      creatorName =
        $scope.oportunidad.nombreUsuario ||
        ($scope.oportunidad.organizacion &&
          $scope.oportunidad.organizacion.nombre) ||
        ($scope.oportunidad.beneficiarioCreador &&
          $scope.oportunidad.beneficiarioCreador.nombre) ||
        "No disponible";

      if (creatorType === "organizacion") {
        return "Creada por organizacion " + creatorName;
      }

      if (creatorType === "beneficiario") {
        return "Creada por beneficiario " + creatorName;
      }

      return "Creada por " + creatorName;
    };

    $scope.getCreatorPanelTitle = function () {
      if (!$scope.oportunidad) {
        return "Creador";
      }

      if (($scope.oportunidad.tipoCreador || "").toLowerCase() === "organizacion") {
        return "Organizacion creadora";
      }

      if (($scope.oportunidad.tipoCreador || "").toLowerCase() === "beneficiario") {
        return "Beneficiario creador";
      }

      return "Creador";
    };

    $scope.getCreatorData = function () {
      if (!$scope.oportunidad) {
        return null;
      }

      if (($scope.oportunidad.tipoCreador || "").toLowerCase() === "organizacion") {
        return $scope.oportunidad.organizacion || null;
      }

      if (($scope.oportunidad.tipoCreador || "").toLowerCase() === "beneficiario") {
        return $scope.oportunidad.beneficiarioCreador || null;
      }

      return null;
    };

    $scope.hasOwnerSolicitudes = function () {
      return $scope.ownerSolicitudes.length > 0;
    };

    $scope.toggleVoluntarioProfile = function (solicitud) {
      solicitud.showVoluntarioProfile = !solicitud.showVoluntarioProfile;
    };

    $scope.getVoluntarioProfileButtonLabel = function (solicitud) {
      return solicitud && solicitud.showVoluntarioProfile
        ? "Ocultar perfil"
        : "Ver perfil";
    };

    $scope.isSolicitudActiva = function (solicitud) {
      var estado = normalizeState(solicitud && solicitud.estado);

      return estado === "PENDIENTE" || estado === "APROBADA";
    };

    $scope.canCancelarMiPostulacion = function () {
      return $scope.isSolicitudActiva($scope.mySolicitud);
    };

    $scope.hasActiveMySolicitud = function () {
      return $scope.isSolicitudActiva($scope.mySolicitud);
    };

    $scope.canRepostularse = function () {
      var estado = normalizeState($scope.mySolicitud && $scope.mySolicitud.estado);

      return estado === "RECHAZADA" || estado === "CANCELADA";
    };

    $scope.getMySolicitudEstado = function () {
      return $scope.mySolicitud ? $scope.mySolicitud.estado : "";
    };

    $scope.loadMySolicitud = function () {
      if (!$scope.oportunidad || !AuthService.canViewMisPostulaciones()) {
        $scope.mySolicitud = null;
        return;
      }

      $scope.isLoadingMySolicitud = true;

      SolicitudesService.getMisSolicitudes().then(
        function (response) {
          var solicitudes = Array.isArray(response.data) ? response.data : [];
          var targetId = Number($scope.oportunidad.id);
          var index;

          $scope.mySolicitud = null;

          for (index = 0; index < solicitudes.length; index += 1) {
            if (
              solicitudes[index].oportunidad &&
              Number(solicitudes[index].oportunidad.id) === targetId
            ) {
              $scope.mySolicitud = solicitudes[index];
              break;
            }
          }
        },
        function (error) {
          console.log("No fue posible cargar la postulacion del usuario.", error);
        }
      ).finally(function () {
        $scope.isLoadingMySolicitud = false;
      });
    };

    $scope.loadOwnerSolicitudes = function () {
      if (!$scope.oportunidad || !$scope.isCurrentUserOwner()) {
        $scope.ownerSolicitudes = [];
        $scope.ownerSolicitudesError = "";
        $scope.ownerActionMessage = "";
        return;
      }

      $scope.isLoadingOwnerSolicitudes = true;
      $scope.ownerSolicitudesError = "";
      $scope.ownerActionMessage = "";

      SolicitudesService.getSolicitudesByOportunidad($scope.oportunidad.id).then(
        function (response) {
          $scope.ownerSolicitudes = Array.isArray(response.data) ? response.data : [];
        },
        function (error) {
          console.error("Error al cargar postulantes", error);
          $scope.ownerSolicitudesError = buildOwnerSolicitudesErrorMessage(error);
        }
      ).finally(function () {
        $scope.isLoadingOwnerSolicitudes = false;
      });
    };

    $scope.refreshSolicitudPanels = function () {
      $scope.loadMySolicitud();
      $scope.loadOwnerSolicitudes();
    };

    $scope.postularse = function () {
      if (!AuthService.hasSession()) {
        $location.path("/auth/login");
        return;
      }

      if (!$scope.isOportunidadActiva()) {
        $scope.postulacionErrorMessage =
          "Esta oportunidad ya no esta disponible para nuevas postulaciones.";
        return;
      }

      if (!$scope.canPostularse()) {
        $scope.postulacionErrorMessage =
          "Tu tipo de usuario no puede postularse a esta oportunidad.";
        return;
      }

      $scope.postulacionErrorMessage = "";
      $scope.postulacionSuccessMessage = "";
      $scope.isSubmittingPostulacion = true;

      SolicitudesService.postularse($scope.oportunidad.id).then(
        function (response) {
          var isReactivation =
            !!$scope.mySolicitud && !$scope.isSolicitudActiva($scope.mySolicitud);

          $scope.mySolicitud =
            response.data || {
              oportunidad: $scope.oportunidad,
              estado: "PENDIENTE",
            };
          $scope.postulacionSuccessMessage =
            isReactivation
              ? "Tu postulacion fue reactivada con estado PENDIENTE."
              : "Tu postulacion fue enviada con estado PENDIENTE.";
        },
        function (error) {
          $scope.postulacionErrorMessage = buildPostulacionErrorMessage(error);
        }
      ).finally(function () {
        $scope.isSubmittingPostulacion = false;
      });
    };

    $scope.cancelarMiPostulacion = function () {
      if (!$scope.mySolicitud || !$scope.canCancelarMiPostulacion()) {
        return;
      }

      $scope.postulacionErrorMessage = "";
      $scope.postulacionSuccessMessage = "";
      $scope.isCancellingPostulacion = true;

      SolicitudesService.cancelarSolicitud($scope.mySolicitud.id).then(
        function (response) {
          $scope.mySolicitud = response.data || angular.extend({}, $scope.mySolicitud, {
            estado: "CANCELADA",
          });
          $scope.postulacionSuccessMessage =
            "Tu postulacion fue cancelada correctamente.";
        },
        function (error) {
          console.error("Error al cancelar mi postulacion", {
            status: error && error.status,
            data: error && error.data,
            solicitudId: $scope.mySolicitud && $scope.mySolicitud.id,
            sessionUserType: AuthService.getSessionUserType(),
            hasToken: !!AuthService.getToken(),
          });
          $scope.postulacionErrorMessage =
            buildCancelarPostulacionErrorMessage(error);
        }
      ).finally(function () {
        $scope.isCancellingPostulacion = false;
      });
    };

    $scope.cancelarOportunidad = function () {
      if (!$scope.oportunidad || !$scope.isCurrentUserOwner() || !$scope.isOportunidadActiva()) {
        return;
      }

      $scope.ownerSolicitudesError = "";
      $scope.ownerActionMessage = "";
      $scope.postulacionErrorMessage = "";
      $scope.postulacionSuccessMessage = "";
      $scope.isCancellingOportunidad = true;

      OportunidadesService.deleteOportunidad($scope.oportunidad.id).then(
        function (response) {
          $scope.oportunidad.estado = "CANCELADA";
          angular.forEach($scope.ownerSolicitudes, function (solicitud) {
            solicitud.estado = "CANCELADA";
          });
          if ($scope.mySolicitud) {
            $scope.mySolicitud.estado = "CANCELADA";
          }
          $scope.ownerActionMessage =
            (response.data && response.data.message) ||
            "Oportunidad cancelada correctamente";
        },
        function (error) {
          $scope.ownerSolicitudesError =
            buildCancelarOportunidadErrorMessage(error);
        }
      ).finally(function () {
        $scope.isCancellingOportunidad = false;
      });
    };

    $scope.updateSolicitudEstado = function (solicitud, estado) {
      $scope.ownerSolicitudesError = "";
      $scope.ownerActionMessage = "";
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
          $scope.ownerSolicitudesError = buildOwnerSolicitudesErrorMessage(error);
        }
      ).finally(function () {
        $scope.updatingSolicitudPorId[solicitud.id] = false;
      });
    };

    $scope.loadOportunidad = function () {
      $scope.isLoading = true;
      $scope.loadError = false;
      $scope.loadErrorMessage = "";

      OportunidadesService.getOportunidadById($stateParams.id).then(
        function (response) {
          $scope.oportunidad = response.data;
          $scope.isLoading = false;

          if (!$scope.oportunidad) {
            $scope.loadError = true;
            $scope.loadErrorMessage =
              "La oportunidad solicitada no se encuentra disponible.";
            return;
          }

          $scope.refreshSolicitudPanels();
        },
        function (error) {
          console.error("Error al cargar la oportunidad", error);
          $scope.loadError = true;
          $scope.loadErrorMessage =
            "No fue posible cargar la oportunidad solicitada.";
          $scope.isLoading = false;
        }
      );
    };

    AuthService.restoreSession()
      .catch(function (error) {
        console.log("No se pudo reconstruir la sesion actual.", error);
      })
      .finally(function () {
        $scope.refreshSolicitudPanels();
      });

    $scope.loadOportunidad();
  }
);
