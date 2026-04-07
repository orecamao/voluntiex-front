var app = angular.module("voluntiexApp", ["ui.router"]);

app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.hashPrefix("");

  $stateProvider
    .state("home", {
      url: "/",
      templateUrl: "views/home.html",
      controller: "HomeController",
    })
    .state("login", {
      url: "/auth/login",
      templateUrl: "views/login.html",
      controller: "AuthController",
    })
    .state("register", {
      url: "/auth/register",
      templateUrl: "views/register.html",
      controller: "AuthController",
    })
    .state("register-success", {
      url: "/auth/register-success",
      templateUrl: "views/register-success.html",
      controller: "AuthController",
    })
    .state("add-oportunidad", {
      url: "/add-oportunidad",
      templateUrl: "views/add-oportunidad.html",
      controller: "OportunidadesController",
    })
    .state("voluntarios", {
      url: "/voluntarios",
      templateUrl: "views/voluntarios.html",
      controller: "VoluntariosController",
    })
    .state("organizaciones", {
      url: "/organizaciones",
      templateUrl: "views/organizaciones.html",
      controller: "OrganizacionesController",
    })
    .state("oportunidades", {
      url: "/oportunidades",
      templateUrl: "views/oportunidades.html",
      controller: "OportunidadesController",
    })
    .state("oportunidad-detalle", {
      url: "/oportunidades/:id",
      templateUrl: "views/oportunidad-detalle.html",
      controller: "OportunidadDetalleController",
    })
    .state("beneficiarios", {
      url: "/beneficiarios",
      templateUrl: "views/beneficiarios.html",
      controller: "BeneficiariosController",
    });
  $urlRouterProvider.otherwise("/");
});
