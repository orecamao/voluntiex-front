app.factory("OrganizacionesService", function ($http) {
  var apiUrl = "http://localhost:8080/organizaciones";

  return {
    getOrganizaciones: function () {
      return $http.get(apiUrl);
    },
    createOrganizacion: function (organizacion) {
      return $http.post(apiUrl, organizacion);
    },
    deleteOrganizacion: function (id) {
      return $http.delete(apiUrl + "/" + id);
    },
  };
});
