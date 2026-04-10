app.factory("BeneficiariosService", function ($http, AuthService) {
  var apiUrl = "http://localhost:8080/beneficiarios";

  return {
    getBeneficiarios: function () {
      return $http.get(apiUrl, AuthService.addAuthHeader({}));
    },
    createBeneficiario: function (beneficiario) {
      return $http.post(
        apiUrl,
        beneficiario,
        AuthService.addAuthHeader({
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    },
    updateBeneficiario: function (id, beneficiario) {
      return $http.put(
        apiUrl + "/" + id,
        beneficiario,
        AuthService.addAuthHeader({
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    },
    deleteBeneficiario: function (id) {
      return $http.delete(apiUrl + "/" + id, AuthService.addAuthHeader({}));
    },
  };
});
