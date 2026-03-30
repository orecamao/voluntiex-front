app.factory("AuthService", function ($http) {
  var apiUrl = "http://localhost:8080/auth";

  return {
    login: function (usuario) {
      return $http
        .post(apiUrl + "/login", usuario, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then(function (response) {
          const token = response.data.token; 
          localStorage.setItem("jwt_token", token);
          return response;
        });
    },
    logout: function () {
      localStorage.removeItem("jwt_token");
    },
    register: function (nuevoUsuario) {
      return $http.post(apiUrl + "/register", nuevoUsuario, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    getToken: function () {
      return localStorage.getItem("jwt_token");
    },
    addAuthHeader: function (config) {
      const token = this.getToken();
      if (token) {
        config.headers["Authorization"] = "Bearer " + token;
      }
      return config;
    },
  };
});
