LazyLoad.js([window.ControllerSite + "http://localhost:8000/js/jquery.min.js?mbiyaov=" + window.version, window.ControllerSite + "http://localhost:8000/js/jquery.lazyload.min.js?mbiyaov=" + window.version, window.ControllerSite + "http://localhost:8000/js/ourslider.js?mbiyaov=" + window.version, window.ControllerSite + "http://cdn.bootcss.com/angular.js/1.4.6/angular.min.js?mbiyaov=" + window.version, window.ControllerSite + "http://cdn.bootcss.com/angular.js/1.4.6/angular-route.min.js?mbiyaov=" + window.version], function() {
	var config = {
		url: "http://120.76.137.59",
		staticImageUrl: "http://120.76.137.59/files/image?name=",
		common_params: {
			invoke: "h5"
		},
		request: {
			SUCCESS: 200
		},
		response: {
			SUCCESS: 1
		}
	}
	var app = angular.module('yz', ["ngRoute"])
		.config(function($routeProvider, $locationProvider) {
			$routeProvider
				.when("/", {})
				.otherwise({
					redirectTo: "/"
				})
			$locationProvider.html5Mode(true);
		})
		.controller("newsController", function($scope, $window, toastServices, errorServices, newsServices) {
			$scope.news = [];
			$scope.staticImageUrl = config.staticImageUrl;
			$scope.page = {
				pn: 1,
				page_size: 20,
				message: "点击加载更多"
			}
			$scope.loadMore = function() {
				if ($scope.no_more) {
					return;
				}
				toastServices.show();
				$scope.page.message = "正在加载...";
				newsServices.query($scope.page).then(function(data) {
					$("body").css({
						visibility: "visible"
					});
					toastServices.hide();
					$scope.page.message = "点击加载更多";
					if (data.code == config.request.SUCCESS && data.status == config.response.SUCCESS) {
						$scope.news = $scope.news.concat(data.Result.InformationList.list);
						$scope.no_more = $scope.news.length == data.Result.InformationList.totalRow ? true : false;
					} else {
						errorServices.autoHide("服务器错误");
					}
					if ($scope.no_more) {
						$scope.page.message = "没有了";
					}
					$scope.page.pn++;
				})

			}
			$scope.loadMore();
			$scope.show_detail = function(id) {
				$window.location.href = config.url + "/app/Informations/InformationH5?information_id=" + id;
			}
		})
		.factory("newsServices", function($http) {
			return {
				query: function(input) {
					return $http({
						// by dribehance <dribehance.kksdapp.com>
						url: config.url + "/app/Informations/InformationList",
						method: "GET",
						params: angular.extend({}, config.common_params, input)
					}).then(function(data) {
						return data.data;
					});
				}
			}
		})
		.directive('imageview', function() {
			return {
				restrict: 'E',
				scope: {
					src: "="
				},
				template: "<img ng-src='{{src}}' show-on-loaded>",
				link: function(scope, element, attrs) {
					var bg_image = "../images/zwpic.png";
					var rate = parseFloat(scope.$eval($(element).attr('data-rate')));
					if (!rate) {
						console.log("unexpect rate")
						return;
					}
					var style = {
						display: "block",
						width: $(element).width() || $(element).parent().width(),
						overflow: "hidden",
						"text-align": "center",
						"background-image": "url(" + bg_image + ")",
						"background-size": "100%",
						"background-position": "center center",
						"line-height": ($(element).width() || $(element).parent().width()) / rate + "px",
						"height": ($(element).width() || $(element).parent().width()) / rate
					}
					$(element).css(style);
					$(element).parent().css({
						overflow: "hidden"
					});
				}
			};
		})
		.directive('showOnLoaded', function() {
			return {
				link: function(scope, element, attrs) {
					$(element).css({
						"visibility": "hidden"
					})
					element.bind('load', function() {
						console.log("loaded")
						var rate = parseFloat(scope.$eval($(element).parent().attr("data-rate")));
						if (!rate) {
							console.log("unexpect rate")
							return;
						}
						var actural_rate = $(element).width() / $(element).height();
						if (actural_rate < rate) {
							$(element).css({
								"height": "100%",
								"width": "auto"
							})
						} else {
							$(element).css({
								"height": "auto",
								"width": "100%"
							})
						}
						$(element).parent().css({
							"background-image": "none"
						})
						$(element).css({
							"visibility": "visible"
						})
					});
				}
			}
		})
		.factory("toastServices", function() {
			return {
				show: function() {
					$(".toast").show();
				},
				hide: function() {
					$(".toast").hide();
				}
			}
		})
		.factory("errorServices", function($rootScope, $timeout, toastServices) {
			return {
				show: function(error) {
					$(".error-msg").html(error);
					$(".error-msg").show();
				},
				hide: function() {
					$(".error-msg").html("");
					$(".error-msg").hide();
				},
				autoHide: function(error) {
					$(".error-msg").html(error);
					$(".error-msg").show();
					$timeout(function() {
						$(".error-msg").html("");
						$(".error-msg").hide();
					}, 1000)
				},
				requestError: function(data, status, headers, config) {
					// hide toast
					toastServices.hide();
					// tip error
					switch (status) {
						case 0:
							this.autoHide("连接超时");
							break;
						case 500:
						case 501:
						case 502:
						case 503:
						case 504:
						case 505:
						case 506:
						case 507:
						case 509:
						case 510:
							this.autoHide("服务器连接出错");
							break;
						default:
							;
					}
					console.log("onRequestError output status, data, headers, config")
					console.log(status);
					console.log(data);
					console.log(headers)
					console.log(config);
					console.log("onRequestError end")
				}
			}
		});

	angular.bootstrap(document, ['yz']);
});

function imageLoad(element) {
	var viewport_width = $(element).parent().width() || $(window).width();
	var rate = parseFloat(eval($(element).attr("data-rate")));
	if (!rate) {
		console.log("unexpect rate")
		return;
	}
	var actural_rate = $(element).width() / $(element).height();
	if (actural_rate < rate) {
		$(element).css({
			"height": "100%",
			"width": "auto",
		})
	} else {
		$(element).css({
			"height": "auto",
			"width": "100%"
		})
	}
	$(element).parent().css({
		"background": "none",
		"display": "block",
		"height": viewport_width / rate,
		"overflow": "hidden"
	})
	$(element).css({
		"visibility": "visible"
	})
}