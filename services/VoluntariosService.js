app.factory("VoluntariosService", function ($http) {
  var apiUrl = "http://localhost:8080/voluntarios"; // URL de la API

  return {
    getVoluntarios: function () {
      return $http.get(apiUrl);
    },
    createVoluntario: function (voluntario) {
      return $http.post(apiUrl, voluntario);
    },
    deleteVoluntario: function (id) {
      return $http.delete(apiUrl + "/" + id);
    },
  };
});
