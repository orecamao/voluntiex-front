app.factory("OportunidadesService", function ($http) {
  var apiUrl = "http://localhost:8080/oportunidades";

  return {
    getOportunidades: function () {
      return $http.get(apiUrl + "/all");
    },
    createOportunidad: function (oportunidad) {
      return $http.post(apiUrl, oportunidad, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    deleteOportunidad: function (id) {
      return $http.delete(apiUrl + "/" + id);
    },
    getFiltroOportunidades: function (filtros) {
      return $http({
        method: "GET",
        url: apiUrl,
        params: filtros,
      });
    },
  };
});
