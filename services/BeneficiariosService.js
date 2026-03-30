app.factory("BeneficiariosService", function ($http) {
  var apiUrl = "http://localhost:8080/beneficiarios";

  return {
    getBeneficiarios: function () {
      return $http.get(apiUrl);
    },
    createBeneficiario: function (beneficiario) {
      return $http.post(apiUrl, beneficiario);
    },
    deleteBeneficiario: function (id) {
      return $http.delete(apiUrl + "/" + id);
    },
  };
});
