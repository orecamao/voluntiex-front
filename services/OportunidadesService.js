app.factory("OportunidadesService", function ($http, AuthService) {
  var apiUrl = "http://localhost:8080/oportunidades";
  var cachedOportunidades = [];

  function cacheOportunidades(oportunidades) {
    cachedOportunidades = Array.isArray(oportunidades) ? oportunidades : [];
    return cachedOportunidades;
  }

  function upsertCachedOportunidad(oportunidad) {
    var updated = false;
    var i;

    if (!oportunidad || !oportunidad.id) {
      return oportunidad;
    }

    for (i = 0; i < cachedOportunidades.length; i++) {
      if (Number(cachedOportunidades[i].id) === Number(oportunidad.id)) {
        cachedOportunidades[i] = oportunidad;
        updated = true;
        break;
      }
    }

    if (!updated) {
      cachedOportunidades.push(oportunidad);
    }

    return oportunidad;
  }

  function formatDateValue(value) {
    if (!value) {
      return "";
    }

    if (angular.isDate(value)) {
      return value.toISOString().slice(0, 10);
    }

    return value;
  }

  function buildBeneficiariosPayload(beneficiarios) {
    if (!Array.isArray(beneficiarios) || beneficiarios.length === 0) {
      return [];
    }

    return beneficiarios
      .filter(function (beneficiario) {
        return beneficiario && beneficiario.id;
      })
      .map(function (beneficiario) {
        return { id: Number(beneficiario.id) };
      });
  }

  function buildCreatePayload(oportunidad) {
    var payload = {
      titulo: oportunidad.titulo,
      descripcion: oportunidad.descripcion,
      ubicacion: oportunidad.ubicacion,
      categoria: oportunidad.categoria,
      fechaInicio: formatDateValue(oportunidad.fechaInicio),
      fechaFin: formatDateValue(oportunidad.fechaFin),
      duracion: Number(oportunidad.duracion),
      tipo: oportunidad.tipo,
      requisitos: oportunidad.requisitos,
    };
    var beneficiarios = buildBeneficiariosPayload(oportunidad.beneficiarios);

    if (beneficiarios.length > 0) {
      payload.beneficiarios = beneficiarios;
    }

    return payload;
  }

  function buildFilterParams(filtros) {
    var params = {};

    angular.forEach(filtros || {}, function (value, key) {
      if (value !== null && value !== undefined && value !== "") {
        params[key] = value;
      }
    });

    return params;
  }

  return {
    getOportunidades: function () {
      return $http.get(apiUrl).then(function (response) {
        cacheOportunidades(response.data);
        return response;
      });
    },
    getMisOportunidades: function () {
      return $http
        .get(apiUrl + "/mias", AuthService.addAuthHeader({}))
        .then(function (response) {
          cacheOportunidades(response.data);
          return response;
        });
    },
    createOportunidad: function (oportunidad) {
      return $http
        .post(
          apiUrl,
          buildCreatePayload(oportunidad),
          AuthService.addAuthHeader({
            headers: {
              "Content-Type": "application/json",
            },
          })
        )
        .then(function (response) {
          upsertCachedOportunidad(response.data);
          return response;
        });
    },
    updateOportunidad: function (id, oportunidad) {
      return $http
        .put(
          apiUrl + "/" + id,
          buildCreatePayload(oportunidad),
          AuthService.addAuthHeader({
            headers: {
              "Content-Type": "application/json",
            },
          })
        )
        .then(function (response) {
          upsertCachedOportunidad(response.data);
          return response;
        });
    },
    deleteOportunidad: function (id) {
      return $http.delete(
        apiUrl + "/" + id,
        AuthService.addAuthHeader({})
      );
    },
    getFiltroOportunidades: function (filtros) {
      return $http({
        method: "GET",
        url: apiUrl,
        params: buildFilterParams(filtros),
      }).then(function (response) {
        cacheOportunidades(response.data);
        return response;
      });
    },
    getOportunidadById: function (id) {
      return $http.get(apiUrl + "/" + id).then(function (response) {
        upsertCachedOportunidad(response.data);
        return response;
      });
    },
    getCachedOportunidades: function () {
      return cachedOportunidades.slice();
    },
  };
});
