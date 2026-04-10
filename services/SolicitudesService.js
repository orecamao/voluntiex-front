app.factory("SolicitudesService", function ($http, AuthService) {
  var apiUrl = "http://localhost:8080/solicitudes";

  function buildJsonConfig() {
    return AuthService.addAuthHeader({
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return {
    postularse: function (oportunidadId) {
      return $http.post(
        apiUrl + "/oportunidades/" + oportunidadId,
        null,
        AuthService.addAuthHeader({})
      );
    },
    getSolicitudesByOportunidad: function (oportunidadId) {
      return $http.get(
        apiUrl + "/oportunidades/" + oportunidadId,
        AuthService.addAuthHeader({})
      );
    },
    updateEstadoSolicitud: function (solicitudId, estado) {
      return $http.put(
        apiUrl + "/" + solicitudId + "/estado",
        { estado: estado },
        buildJsonConfig()
      );
    },
    getMisSolicitudes: function () {
      return $http.get(apiUrl + "/mias", AuthService.addAuthHeader({}));
    },
    cancelarSolicitud: function (solicitudId) {
      return $http.put(
        apiUrl + "/" + solicitudId + "/cancelar",
        {},
        buildJsonConfig()
      );
    },
  };
});
