app.factory("AuthService", function ($http, $q) {
  var apiUrl = "http://localhost:8080/auth";
  var tokenKey = "auth_token";
  var userNameKey = "auth_nombre";
  var userEmailKey = "auth_email";
  var userTypeKey = "auth_tipo";
  var restoreSessionPromise = null;
  var session = {
    token: "",
    nombre: "",
    email: "",
    tipo: "",
  };

  function getStoredValue(key) {
    return window.sessionStorage.getItem(key) || "";
  }

  function normalizeUserType(tipo) {
    return (tipo || "").toString().trim().toLowerCase();
  }

  function formatUserTypeLabel(tipo) {
    var normalizedType = normalizeUserType(tipo);

    if (normalizedType === "organizacion") {
      return "organizaci\u00f3n";
    }

    return normalizedType;
  }

  function readSessionFromStorage() {
    return {
      token: getStoredValue(tokenKey),
      nombre: getStoredValue(userNameKey),
      email: getStoredValue(userEmailKey),
      tipo: normalizeUserType(getStoredValue(userTypeKey)),
    };
  }

  function syncSessionFromStorage() {
    if (!session.token) {
      session.token = getStoredValue(tokenKey);
    }

    if (!session.nombre) {
      session.nombre = getStoredValue(userNameKey);
    }

    if (!session.email) {
      session.email = getStoredValue(userEmailKey);
    }

    if (!session.tipo) {
      session.tipo = normalizeUserType(getStoredValue(userTypeKey));
    }
  }

  function saveSession(sessionData) {
    session.token = sessionData.token || "";
    session.nombre = sessionData.nombre || "";
    session.email = sessionData.email || "";
    session.tipo = normalizeUserType(sessionData.tipo);

    if (session.token) {
      window.sessionStorage.setItem(tokenKey, session.token);
    } else {
      window.sessionStorage.removeItem(tokenKey);
    }

    if (session.nombre) {
      window.sessionStorage.setItem(userNameKey, session.nombre);
    } else {
      window.sessionStorage.removeItem(userNameKey);
    }

    if (session.email) {
      window.sessionStorage.setItem(userEmailKey, session.email);
    } else {
      window.sessionStorage.removeItem(userEmailKey);
    }

    if (session.tipo) {
      window.sessionStorage.setItem(userTypeKey, session.tipo);
    } else {
      window.sessionStorage.removeItem(userTypeKey);
    }
  }

  function clearSession() {
    saveSession({
      token: "",
      nombre: "",
      email: "",
      tipo: "",
    });
  }

  function buildAuthorizationHeader(token) {
    if (!token) {
      return "";
    }

    return /^Bearer\s+/i.test(token) ? token : "Bearer " + token;
  }

  function buildAuthConfig(config) {
    syncSessionFromStorage();

    config = config || {};
    config.headers = config.headers || {};

    if (session.token) {
      config.headers.Authorization = buildAuthorizationHeader(session.token);
    }

    return config;
  }

  function getSessionSnapshot() {
    syncSessionFromStorage();

    return {
      token: session.token,
      nombre: session.nombre,
      email: session.email,
      tipo: session.tipo,
    };
  }

  function buildLoginPayload(usuario) {
    return {
      email: usuario.email,
      password: usuario.password,
    };
  }

  function buildRegisterPayload(nuevoUsuario) {
    return {
      nombre: nuevoUsuario.nombre,
      tipo: normalizeUserType(nuevoUsuario.tipo),
      email: nuevoUsuario.email,
      password: nuevoUsuario.password,
    };
  }

  function isSameValue(left, right) {
    return (left || "").toString().trim().toLowerCase() ===
      (right || "").toString().trim().toLowerCase();
  }

  function isOpportunityOwnerForSession(currentSession, oportunidad) {
    var creatorType;

    if (!currentSession.token || !currentSession.tipo || !oportunidad) {
      return false;
    }

    creatorType = normalizeUserType(oportunidad.tipoCreador);

    if (!creatorType || currentSession.tipo !== creatorType) {
      return false;
    }

    if (
      creatorType === "organizacion" &&
      oportunidad.organizacion &&
      isSameValue(oportunidad.organizacion.email, currentSession.email)
    ) {
      return true;
    }

    if (
      creatorType === "beneficiario" &&
      oportunidad.beneficiarioCreador &&
      isSameValue(oportunidad.beneficiarioCreador.email, currentSession.email)
    ) {
      return true;
    }

    if (isSameValue(oportunidad.nombreUsuario, currentSession.nombre)) {
      return true;
    }

    if (
      oportunidad.organizacion &&
      isSameValue(oportunidad.organizacion.nombre, currentSession.nombre)
    ) {
      return true;
    }

    if (
      oportunidad.beneficiarioCreador &&
      isSameValue(oportunidad.beneficiarioCreador.nombre, currentSession.nombre)
    ) {
      return true;
    }

    return false;
  }

  return {
    login: function (usuario) {
      return $http
        .post(apiUrl + "/login", buildLoginPayload(usuario), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(function (response) {
          saveSession({
            token: response.data.token,
            nombre: response.data.nombre,
            email: response.data.email || usuario.email,
            tipo: response.data.tipo,
          });

          return response;
        });
    },
    logout: function () {
      clearSession();
    },
    register: function (nuevoUsuario) {
      return $http.post(apiUrl + "/register", buildRegisterPayload(nuevoUsuario), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    changePassword: function (currentPassword, newPassword) {
      return $http.put(
        apiUrl + "/change-password",
        {
          currentPassword: currentPassword,
          newPassword: newPassword,
        },
        buildAuthConfig({
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    },
    restoreSession: function () {
      var storedSession = readSessionFromStorage();

      if (session.token && (session.nombre || session.email) && session.tipo) {
        return $q.when(getSessionSnapshot());
      }

      if (!storedSession.token) {
        clearSession();
        return $q.when(null);
      }

      session.token = storedSession.token;
      session.nombre = session.nombre || storedSession.nombre;
      session.email = session.email || storedSession.email;
      session.tipo = session.tipo || storedSession.tipo;

      if (restoreSessionPromise) {
        return restoreSessionPromise;
      }

      restoreSessionPromise = $http
        .get(apiUrl + "/me", buildAuthConfig())
        .then(
          function (response) {
            saveSession({
              token: storedSession.token,
              nombre: response.data.nombre || storedSession.nombre,
              email: response.data.email || storedSession.email,
              tipo: response.data.tipo || storedSession.tipo,
            });

            return getSessionSnapshot();
          },
          function (error) {
            if (
              error &&
              (error.status === 0 || error.status >= 500) &&
              (storedSession.nombre || storedSession.email || storedSession.tipo)
            ) {
              saveSession(storedSession);
              return getSessionSnapshot();
            }

            clearSession();
            return $q.reject(error);
          }
        )
        .finally(function () {
          restoreSessionPromise = null;
        });

      return restoreSessionPromise;
    },
    getToken: function () {
      return getSessionSnapshot().token;
    },
    getSessionUserName: function () {
      return getSessionSnapshot().nombre;
    },
    getSessionUserEmail: function () {
      return getSessionSnapshot().email;
    },
    getSessionUserType: function () {
      return getSessionSnapshot().tipo;
    },
    getSessionUserTypeLabel: function () {
      return formatUserTypeLabel(this.getSessionUserType());
    },
    hasSession: function () {
      return !!this.getToken();
    },
    isUserType: function (tipo) {
      return this.getSessionUserType() === normalizeUserType(tipo);
    },
    canCreateOportunidad: function () {
      return this.isUserType("beneficiario") || this.isUserType("organizacion");
    },
    canApplyToOpportunities: function () {
      return this.isUserType("voluntario");
    },
    canViewMisPostulaciones: function () {
      return this.canApplyToOpportunities();
    },
    canViewMisOportunidades: function () {
      return this.canCreateOportunidad();
    },
    isOpportunityOwner: function (oportunidad) {
      return isOpportunityOwnerForSession(getSessionSnapshot(), oportunidad);
    },
    addAuthHeader: function (config) {
      return buildAuthConfig(config);
    },
  };
});
