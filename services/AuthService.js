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

  function readSessionFromStorage() {
    return {
      token: getStoredValue(tokenKey),
      nombre: getStoredValue(userNameKey),
      email: getStoredValue(userEmailKey),
      tipo: getStoredValue(userTypeKey),
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
      session.tipo = getStoredValue(userTypeKey);
    }
  }

  function saveSession(sessionData) {
    session.token = sessionData.token || "";
    session.nombre = sessionData.nombre || "";
    session.email = sessionData.email || "";
    session.tipo = sessionData.tipo || "";

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

  function formatUserType(tipo) {
    if (!tipo) {
      return "";
    }

    if (tipo.toLowerCase() === "organizacion") {
      return "organizaci\u00f3n";
    }

    return tipo.toLowerCase();
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

  return {
    login: function (usuario) {
      return $http
        .post(apiUrl + "/login", usuario, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(function (response) {
          saveSession({
            token: response.data.token,
            nombre: response.data.nombre,
            email: response.data.email || usuario.email,
            tipo: formatUserType(response.data.tipo),
          });

          return response;
        });
    },
    logout: function () {
      clearSession();
    },
    register: function (nuevoUsuario) {
      return $http.post(apiUrl + "/register", nuevoUsuario, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    restoreSession: function () {
      var storedSession = readSessionFromStorage();

      if (session.token && session.nombre) {
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
              nombre: response.data.nombre,
              email: response.data.email || storedSession.email,
              tipo: formatUserType(response.data.tipo) || storedSession.tipo,
            });

            return getSessionSnapshot();
          },
          function (error) {
            if (storedSession.nombre || storedSession.email || storedSession.tipo) {
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
    hasSession: function () {
      return !!this.getToken();
    },
    addAuthHeader: function (config) {
      return buildAuthConfig(config);
    },
  };
});
