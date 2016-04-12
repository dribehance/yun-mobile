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
		.controller('sidebarConroller', function($scope, $rootScope, $window, $location, $http) {
			// 精品
			$http({
				// by dribehance <dribehance.kksdapp.com>
				url: config.url + "/app/Home/boutiqueList",
				method: "GET",
				params: angular.extend({}, config.common_params)
			}).then(function(data) {
				var menu = {},
					menus = [];
				menu["data_id"] = "jingpin";
				menu["name"] = "精品推荐";
				menu["type"] = "menu_type";
				menus.push(menu);
				angular.forEach(data.data.BoutiqueList, function(v, k) {
					menu = {};
					menu["data_pid"] = "jingpin";
					menu["name"] = v.classify_two_name;
					menu["type"] = "menu_type2";
					menu["id"] = v.classify_two_id
					menus.push(menu)
				});
				$scope.jingpin_menu = menus;
			});
			// 常规分类
			$http({
				// by dribehance <dribehance.kksdapp.com>
				url: config.url + "/app/ClassifyManage/classifyList",
				method: "GET",
				params: angular.extend({}, config.common_params)
			}).then(function(data) {
				var menu = {},
					menus = [];
				angular.forEach(data.data.ClassifyTwoList, function(v, k) {
					menu = {};
					menu["data_id"] = k;
					menu["name"] = v.classify_one_name;
					menu["type"] = "menu_type";
					menus.push(menu);
					angular.forEach(v.clTwos, function(_v, _k) {
						menu = {};
						menu["data_pid"] = k;
						menu["name"] = _v.classify_two_name;
						menu["type"] = "menu_type2";
						menu["id"] = _v.classify_two_id
						menus.push(menu)
					})
				})
				$scope.menus = menus;
				$scope.toggle = function(m) {
					if (m.type == 'menu_type2') {
						$rootScope.current_category_id = m.id;
						$rootScope.$emit("category_change")
							// $window.location.href = $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/index.html?id=" + m.id;
						return;
					}
					var e = m.data_id ? m.data_id : "0";
					var _this = $('.menu_type[data-id="' + e + '"]');
					if (_this.find(".menu_ss").length <= 0 && ($(".menu_type2").hide(), $(".menu_ss").removeClass("menu_ss")), $('.menu_type2[data-pid="' + e + '"]').length > 0) $('.menu_type2[data-pid="' + e + '"]').toggle(), _this.find(".menu_zk").toggleClass("menu_ss");
					else {
						var a = $(this).attr("data-url");
						void 0 != a && (window.location.href = a)
					}
				}
			});
		})
		.controller("bannerController", function($scope, $http) {

			$http({
				// by dribehance <dribehance.kksdapp.com>
				url: config.url + "/app/IndexBannerManage/indexBanner",
				method: "GET",
				params: angular.extend({}, config.common_params)
			}).then(function(data) {
				var bannerList = data.data.IndexBanners;
				if (bannerList.length > 0) {
					var o = "",
						s = $(".slidermain"),
						l = s.find("ul")
					l.css({
						height: l.find("img").height() + "px",
						overflow: "hidden"
					});
					for (var d = 0; d < bannerList.length; d++) o = o + '<li><a><img onload="imageLoad(this)" data-rate="750/454" onload="imageLoad(this)" onerror=javascript:this.src="../images/zwpic-750-454.png" bannertype="' + bannerList[d].banner_type + '" class="lb err-src" src="' + config.staticImageUrl + bannerList[d].cover + '"/></a></li>';
					bannerList.length > 1 ? (l.html(o).append(l.children()[0].outerHTML).prepend(l.children()[0].outerHTML)) : l.html(o)
					s.ourSlider({
						scurpage: 2,
						autoplay: !0,
						playspeed: 4e3,
						movespeed: 3,
						callbacks: function() {}
					});
				} else $(".m_slider").remove();
			});
		})
		.controller("productsController", function($scope, $window, $rootScope, $routeParams, productsServices, errorServices, toastServices) {
			$scope.category_id = $rootScope.current_category_id;
			if (!$scope.category_id) {
				$scope.category_id = 0;
			}
			$scope.staticImageUrl = config.staticImageUrl;
			$scope.products = [];
			$scope.page = {
				pn: 1,
				page_size: 20,
				message: "点击加载更多",
				classify_two_id: $scope.category_id
			}
			$scope.loadMore = function() {
				if ($scope.no_more) {
					return;
				}
				toastServices.show();
				$scope.page.message = "正在加载...";
				productsServices.query($scope.page).then(function(data) {
					toastServices.hide();
					$scope.page.message = "点击加载更多";
					$("body").css({
						visibility: "visible"
					});
					if (data.code == config.request.SUCCESS && data.status == config.response.SUCCESS) {
						$scope.products = $scope.products.concat(data.Result.Products.list);
						$scope.no_more = $scope.products.length == data.Result.Products.totalRow ? true : false;
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
			$rootScope.$on("category_change", function(e) {
				$scope.products = [];
				$scope.page = {
					pn: 1,
					page_size: 20,
					message: "点击加载更多",
					classify_two_id: $rootScope.current_category_id
				}
				$scope.no_more = false;
				$scope.loadMore();
				$("html,body").removeClass("o_flow").removeAttr("style");
				$(".s_wrapBg").addClass("none");
				$(".slider_list").addClass("none");
			});
			$rootScope.current_category_id = $rootScope.current_category_id || 0;
			$scope.show_product = function(id) {
				$window.location.href = "product.html?product_id=" + id + "&category_id=" + $rootScope.current_category_id;
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
				}
			}
		});

	angular.bootstrap(document, ['yz']);
	$(".logopic").bind("click", function() {
		if ($(".s_wrapBg").toggleClass("none"), $(".slider_list").toggleClass("none"), $(".s_wrapBg").hasClass("none")) $("html,body").removeClass("o_flow").removeAttr("style");
		else {
			var e = $(window).height();
			$("html,body").addClass("o_flow").attr("style", "height:" + e + "px")
		}
		$("body").css({
			visibility: "visible"
		})
	});
	$(".s_wrapBg").bind("click", function() {
		$("html,body").removeClass("o_flow").removeAttr("style"), $(".s_wrapBg").addClass("none"), $(".slider_list").addClass("none");
		$("body").css({
			visibility: "visible"
		})
		if ($(".toapp").length > 0) {
			$("body").css({
				"padding-bottom": "60px"
			})
		}
	});
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