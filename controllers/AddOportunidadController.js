app.controller(
  "AddOportunidadController",
  function (
    $scope,
    $q,
    $location,
    OportunidadesService,
    BeneficiariosService,
    AuthService
  ) {
    function createEmptyOportunidad() {
      return {
        titulo: "",
        descripcion: "",
        ubicacion: "",
        categoria: "",
        fechaInicio: "",
        fechaFin: "",
        duracion: "",
        tipo: "",
        requisitos: "",
        beneficiarios: [],
      };
    }

    function createEmptyBeneficiarioDraft() {
      return {
        nombre: "",
        email: "",
        descripcion: "",
        direccion: "",
      };
    }

    function normalizeEmail(email) {
      return (email || "").toString().trim().toLowerCase();
    }

    function generateTemporaryPassword() {
      return (
        "Tmp" +
        Math.random().toString(36).slice(2, 8) +
        Math.floor(Math.random() * 90 + 10) +
        "!"
      );
    }

    function getBackendMessage(error) {
      return error && error.data && (error.data.message || error.data.error)
        ? error.data.message || error.data.error
        : "";
    }

    function buildCreateErrorMessage(error) {
      var backendMessage = getBackendMessage(error);

      if (backendMessage) {
        return backendMessage;
      }

      if (error && error.status === 400) {
        return "La oportunidad no pudo guardarse. Revisa los datos ingresados.";
      }

      if (error && error.message) {
        return error.message;
      }

      return "No fue posible crear la oportunidad en este momento.";
    }

    function buildBeneficiarioErrorMessage(error) {
      var backendMessage = getBackendMessage(error);

      if (backendMessage) {
        return backendMessage;
      }

      if (error && error.message) {
        return error.message;
      }

      return "No fue posible registrar los beneficiarios de la oportunidad.";
    }

    function findBeneficiarioByEmail(beneficiarios, email) {
      var normalizedTarget = normalizeEmail(email);
      var index;

      for (index = 0; index < beneficiarios.length; index += 1) {
        if (normalizeEmail(beneficiarios[index].contacto) === normalizedTarget) {
          return beneficiarios[index];
        }
      }

      return null;
    }

    function buildBeneficiarioDrafts() {
      return ($scope.beneficiariosNuevos || [])
        .filter(function (beneficiario) {
          return beneficiario.nombre || beneficiario.email;
        })
        .map(function (beneficiario) {
          return {
            nombre: (beneficiario.nombre || "").trim(),
            email: normalizeEmail(beneficiario.email),
            descripcion: (beneficiario.descripcion || "").trim(),
            direccion: (beneficiario.direccion || "").trim(),
          };
        });
    }

    function validateBeneficiarioDrafts(drafts) {
      var emails = {};
      var index;
      var currentEmail;

      if (!$scope.canRegisterNewBeneficiarios()) {
        return "";
      }

      if (!drafts.length) {
        return "Debes registrar al menos un beneficiario para esta oportunidad.";
      }

      for (index = 0; index < drafts.length; index += 1) {
        if (!drafts[index].nombre || !drafts[index].email) {
          return "Cada beneficiario debe tener nombre y correo.";
        }

        currentEmail = drafts[index].email;
        if (emails[currentEmail]) {
          return "No puedes repetir el mismo correo en varios beneficiarios.";
        }

        emails[currentEmail] = true;
      }

      return "";
    }

    function updateRegisteredBeneficiarios(beneficiariosRegistrados) {
      var chain = $q.when();

      angular.forEach(beneficiariosRegistrados, function (beneficiario) {
        chain = chain.then(function () {
          return BeneficiariosService.updateBeneficiario(beneficiario.id, {
            nombre: beneficiario.nombre,
            descripcion: beneficiario.descripcion,
            contacto: beneficiario.email,
            direccion: beneficiario.direccion,
            estado: "",
          });
        });
      });

      return chain.then(function () {
        return beneficiariosRegistrados;
      });
    }

    function resolveRegisteredBeneficiarios(drafts) {
      return BeneficiariosService.getBeneficiarios().then(function (response) {
        var beneficiarios = Array.isArray(response.data) ? response.data : [];

        return drafts.map(function (draft) {
          var match = findBeneficiarioByEmail(beneficiarios, draft.email);

          if (!match || !match.id) {
            throw new Error(
              "No fue posible encontrar el beneficiario registrado para " +
                draft.email +
                "."
            );
          }

          return {
            id: match.id,
            nombre: draft.nombre,
            email: draft.email,
            descripcion: draft.descripcion,
            direccion: draft.direccion,
            tempPassword: draft.tempPassword,
          };
        });
      });
    }

    function registerBeneficiariosForOpportunity(drafts) {
      var chain = $q.when();

      angular.forEach(drafts, function (draft) {
        chain = chain.then(function () {
          return AuthService.register({
            nombre: draft.nombre,
            email: draft.email,
            password: draft.tempPassword,
            tipo: "beneficiario",
          });
        });
      });

      return chain
        .then(function () {
          return resolveRegisteredBeneficiarios(drafts);
        })
        .then(function (beneficiariosRegistrados) {
          return updateRegisteredBeneficiarios(beneficiariosRegistrados);
        });
    }

    $scope.nuevaOportunidad = createEmptyOportunidad();
    $scope.beneficiariosNuevos = [createEmptyBeneficiarioDraft()];
    $scope.beneficiariosRegistrados = [];
    $scope.createdBeneficiaryCredentials = [];
    $scope.isSubmittingOportunidad = false;
    $scope.isRegisteringBeneficiarios = false;
    $scope.createErrorMessage = "";
    $scope.createSuccessMessage = "";

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

    $scope.canAddOportunidad = function () {
      return AuthService.canCreateOportunidad();
    };

    $scope.canViewMisPostulaciones = function () {
      return AuthService.canViewMisPostulaciones();
    };

    $scope.canViewMisOportunidades = function () {
      return AuthService.canViewMisOportunidades();
    };

    $scope.canRegisterNewBeneficiarios = function () {
      return AuthService.isUserType("organizacion");
    };

    $scope.invalidateRegisteredBeneficiarios = function () {
      $scope.beneficiariosRegistrados = [];
      $scope.createdBeneficiaryCredentials = [];
      $scope.createSuccessMessage = "";
    };

    $scope.addBeneficiarioDraft = function () {
      $scope.beneficiariosNuevos.push(createEmptyBeneficiarioDraft());
      $scope.invalidateRegisteredBeneficiarios();
    };

    $scope.removeBeneficiarioDraft = function (index) {
      if ($scope.beneficiariosNuevos.length === 1) {
        $scope.beneficiariosNuevos[0] = createEmptyBeneficiarioDraft();
      } else {
        $scope.beneficiariosNuevos.splice(index, 1);
      }

      $scope.invalidateRegisteredBeneficiarios();
    };

    $scope.submitOportunidad = function () {
      var beneficiarioDrafts = buildBeneficiarioDrafts();
      var validationError = validateBeneficiarioDrafts(beneficiarioDrafts);
      var beneficiariosPromise;

      if (!AuthService.hasSession()) {
        $location.path("/auth/login");
        return;
      }

      if (!AuthService.canCreateOportunidad()) {
        $scope.createErrorMessage =
          "Tu tipo de usuario no tiene permisos para crear oportunidades.";
        return;
      }

      if (validationError) {
        $scope.createErrorMessage = validationError;
        return;
      }

      $scope.createErrorMessage = "";
      $scope.createSuccessMessage = "";
      $scope.isSubmittingOportunidad = true;

      if ($scope.canRegisterNewBeneficiarios()) {
        if ($scope.beneficiariosRegistrados.length) {
          beneficiariosPromise = $q.when($scope.beneficiariosRegistrados);
        } else {
          beneficiarioDrafts = beneficiarioDrafts.map(function (beneficiario) {
            return angular.extend({}, beneficiario, {
              tempPassword: generateTemporaryPassword(),
            });
          });

          $scope.isRegisteringBeneficiarios = true;
          beneficiariosPromise = registerBeneficiariosForOpportunity(beneficiarioDrafts).then(
            function (beneficiariosRegistrados) {
              $scope.beneficiariosRegistrados = beneficiariosRegistrados;
              return beneficiariosRegistrados;
            },
            function (error) {
              return $q.reject({
                message: buildBeneficiarioErrorMessage(error),
              });
            }
          ).finally(function () {
            $scope.isRegisteringBeneficiarios = false;
          });
        }
      } else {
        $scope.beneficiariosRegistrados = [];
        beneficiariosPromise = $q.when([]);
      }

      beneficiariosPromise
        .then(function (beneficiariosRegistrados) {
          $scope.nuevaOportunidad.beneficiarios = beneficiariosRegistrados.map(
            function (beneficiario) {
              return { id: beneficiario.id };
            }
          );

          return OportunidadesService.createOportunidad($scope.nuevaOportunidad);
        })
        .then(function () {
          $scope.createdBeneficiaryCredentials = angular.copy(
            $scope.beneficiariosRegistrados
          );
          $scope.createSuccessMessage = $scope.canRegisterNewBeneficiarios()
            ? "Oportunidad creada y beneficiarios registrados correctamente."
            : "Oportunidad creada correctamente.";
          $scope.nuevaOportunidad = createEmptyOportunidad();
          $scope.beneficiariosNuevos = [createEmptyBeneficiarioDraft()];
          $scope.beneficiariosRegistrados = [];
        })
        .catch(function (error) {
          console.error("Error al agregar oportunidad", {
            status: error && error.status,
            data: error && error.data,
            sessionUserType: AuthService.getSessionUserType(),
            hasToken: !!AuthService.getToken(),
          });
          $scope.createErrorMessage = buildCreateErrorMessage(error);
        })
        .finally(function () {
          $scope.isSubmittingOportunidad = false;
        });
    };

    AuthService.restoreSession()
      .then(function () {
        if (!AuthService.canCreateOportunidad()) {
          $location.path("/");
        }
      })
      .catch(function (error) {
        console.log("No se pudo reconstruir la sesion actual.", error);
        $location.path("/auth/login");
      });
  }
);
