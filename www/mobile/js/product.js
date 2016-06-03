LazyLoad.js(["mobile/js/jquery.min.js", "mobile/js/jquery.lazyload.min.js", "mobile/js/ourslider.js", "http://cdn.bootcss.com/angular.js/1.4.6/angular.min.js", "http://cdn.bootcss.com/angular.js/1.4.6/angular-route.min.js", "http://cdn.bootcss.com/angular-sanitize/1.5.0/angular-sanitize.js"], function() {
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
	var app = angular.module('yz', ["ngRoute", "ngSanitize"])
		.config(function($routeProvider, $locationProvider) {
			$routeProvider
				.when("/", {})
				.otherwise({
					redirectTo: "/"
				})
			$locationProvider.html5Mode(true);
		})
		.controller("productController", function($scope, $window, $location, toastServices, errorServices, $routeParams, $http, productsServices) {
			var product_id = $location.search().product_id;
			var category_id = $location.search().category_id || 0;
			toastServices.show();
			productsServices.queryById({
				product_id: product_id
			}).then(function(data) {
				toastServices.hide()
				if (data.code == config.request.SUCCESS && data.status == config.response.SUCCESS) {
					$scope.product = data.Result.product;
					bannerList = data.Result.Banners;
					if (bannerList.length > 0) {
						var o = "",
							s = $(".slidermain"),
							l = s.find("ul");
						l.css({
							height: l.find("img").height() + "px",
							overflow: "hidden"
						});
						for (var d = 0; d < bannerList.length; d++) o = o + '<li><a><img data-rate="75/76" onload="imageLoad(this)" onerror=javascript:this.src="../images/zwpic-750-760.png" bannertype="' + bannerList[d].banner_type + '" class="lb err-src" src="' + config.staticImageUrl + bannerList[d].cover + '"/></a></li>';
						bannerList.length > 1 ? (l.html(o).append(l.children()[0].outerHTML).prepend(l.children()[0].outerHTML)) : l.html(o)
						s.ourSlider({
							scurpage: 2,
							autoplay: !0,
							playspeed: 4e3,
							movespeed: 3,
							callbacks: function() {}
						});
					} else $(".m_slider").remove();
					$("body").css({
						visibility: "visible"
					});
				} else {
					errorServices.autoHide(data.message);
				}
			})
			$scope.view = 'content';
			$scope.change_view = function(v) {
				$scope.view = v;
			}
			$scope.comments = [];
			$scope.page = {
				pn: 1,
				page_size: 20,
				message: "点击加载更多",
				product_id: product_id
			}
			$scope.loadMore = function() {
				if ($scope.no_more) {
					return;
				}
				toastServices.show();
				$scope.page.message = "正在加载...";
				productsServices.queryCommentById($scope.page).then(function(data) {
					toastServices.hide();
					$scope.page.message = "点击加载更多";
					if (data.code == config.request.SUCCESS && data.status == config.response.SUCCESS) {
						$scope.comments = $scope.comments.concat(data.Result.Comments.list);
						$scope.no_more = $scope.comments.length == data.Result.Comments.totalRow ? true : false;
					} else {
						errorServices.autoHide("服务器错误");
					}
					if ($scope.no_more) {
						$scope.page.message = "";
					}
					$scope.page.pn++;
				})

			}
			$scope.loadMore();
			toastServices.show();
			productsServices.queryRecommand({
				pn: 1,
				page_size: 20,
				type: 1,
				classify_two_id: category_id,
				product_id: product_id
			}).then(function(data) {
				toastServices.hide()
				if (data.code == config.request.SUCCESS && data.status == config.response.SUCCESS) {
					$scope.recommand_products = data.Result.Products.list;
				} else {
					errorServices.autoHide(data.message);
				}
			});
			$scope.show_product = function(id) {
				$window.location.href = "mobile/product.html?product_id=" + id + "&category_id=" + category_id;
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
							"background": "none"
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
		})
		.factory("productsServices", function($http) {
			return {
				query: function(input) {
					return $http({
						// by dribehance <dribehance.kksdapp.com>
						url: config.url + "/app/Home/productList",
						method: "GET",
						params: angular.extend({}, config.common_params, input)
					}).then(function(data) {
						return data.data;
					});
				},
				queryById: function(input) {
					return $http({
						// by dribehance <dribehance.kksdapp.com>
						url: config.url + "/app/Products/productDetail",
						method: "GET",
						params: angular.extend({}, config.common_params, input)
					}).then(function(data) {
						return data.data;
					});
				},
				queryCommentById: function(input) {
					return $http({
						// by dribehance <dribehance.kksdapp.com>
						url: config.url + "/app/Products/productCommentList",
						method: "GET",
						params: angular.extend({}, config.common_params, input)
					}).then(function(data) {
						return data.data;
					});
				},
				queryRecommand: function(input) {
					return $http({
						// by dribehance <dribehance.kksdapp.com>
						url: config.url + "/app/Home/recommendProductList",
						method: "GET",
						params: angular.extend({}, config.common_params, input)
					}).then(function(data) {
						return data.data;
					});
				}

			}
		});

	angular.bootstrap(document, ['yz']);
	$("body").css("padding-bottom", "60px")
	$("body").prepend('<div class="toapp" style="display: block;"><span class="toappclose"></span></div>');
	$(".toapp").bind("click", function() {
		console.log("goto download")
			// gotodown()
	});
	$(".toappclose").bind("click", function() {
		return $("#m_wap").css("min-height", $(window).height() - 320 + "px"), $("body").css("padding-bottom", "0px"), $(this).parent().remove();
	})
	return;
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