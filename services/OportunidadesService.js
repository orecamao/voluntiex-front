app.factory("OportunidadesService", function ($http, $q) {
  var apiUrl = "http://localhost:8080/oportunidades";
  var cachedOportunidades = [];

  function cacheOportunidades(oportunidades) {
    cachedOportunidades = Array.isArray(oportunidades) ? oportunidades : [];
    return cachedOportunidades;
  }

  function findOportunidadById(id) {
    var targetId = Number(id);

    for (var i = 0; i < cachedOportunidades.length; i++) {
      if (Number(cachedOportunidades[i].id) === targetId) {
        return cachedOportunidades[i];
      }
    }

    return null;
  }

  return {
    getOportunidades: function () {
      return $http.get(apiUrl + "/all").then(function (response) {
        cacheOportunidades(response.data);
        return response;
      });
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
      }).then(function (response) {
        cacheOportunidades(response.data);
        return response;
      });
    },
    getOportunidadById: function (id) {
      var oportunidad = findOportunidadById(id);

      if (oportunidad) {
        return $q.when({ data: oportunidad });
      }

      return $http.get(apiUrl + "/all").then(function (response) {
        var oportunidades = cacheOportunidades(response.data);
        var targetId = Number(id);

        for (var i = 0; i < oportunidades.length; i++) {
          if (Number(oportunidades[i].id) === targetId) {
            return { data: oportunidades[i] };
          }
        }

        return { data: null };
      });
    },
  };
});
