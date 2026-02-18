;(function () {
	
	'use strict';



	var isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		},
			BlackBerry: function() {
			return navigator.userAgent.match(/BlackBerry/i);
		},
			iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
			Opera: function() {
			return navigator.userAgent.match(/Opera Mini/i);
		},
			Windows: function() {
			return navigator.userAgent.match(/IEMobile/i);
		},
			any: function() {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};

	var themeController = function() {
		var storageKey = 'bp-theme';
		var themeButtons = document.querySelectorAll('.js-theme-toggle');
		var mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

		if (!themeButtons.length) {
			return;
		}

		var getSavedTheme = function() {
			try {
				var value = localStorage.getItem(storageKey);
				return value === 'light' || value === 'dark' ? value : null;
			} catch (error) {
				return null;
			}
		};

		var getSystemTheme = function() {
			return mediaQuery && mediaQuery.matches ? 'dark' : 'light';
		};

		var updateButtons = function(theme) {
			var nextTheme = theme === 'dark' ? 'light' : 'dark';
			var buttonLabel = nextTheme === 'dark' ? 'Dark mode' : 'Light mode';

			themeButtons.forEach(function(button) {
				button.textContent = buttonLabel;
				button.setAttribute('aria-label', 'Switch to ' + nextTheme + ' mode');
				button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
			});
		};

		var applyTheme = function(theme, persistPreference) {
			document.documentElement.setAttribute('data-theme', theme);
			updateButtons(theme);

			if (persistPreference) {
				try {
					localStorage.setItem(storageKey, theme);
				} catch (error) {
					// no-op
				}
			}
		};

		var initialTheme = getSavedTheme() || getSystemTheme();
		applyTheme(initialTheme, false);

		themeButtons.forEach(function(button) {
			button.addEventListener('click', function() {
				var currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
				var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
				applyTheme(newTheme, true);
			});
		});

		if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
			mediaQuery.addEventListener('change', function(event) {
				if (getSavedTheme()) {
					return;
				}

				applyTheme(event.matches ? 'dark' : 'light', false);
			});
		}
	};

	var backgroundCanvas = function() {
		var canvas = document.getElementById('bg');
		if (!canvas || !canvas.getContext) {
			return;
		}

		var context = canvas.getContext('2d');
		var mediaQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
		var prefersReducedMotion = mediaQuery ? mediaQuery.matches : false;
		var starsNear = [];
		var starsFar = [];
		var comets = [];
		var frameId = null;
		var width = 0;
		var height = 0;
		var pixelRatio = 1;
		var orbitAngle = 0;
		var lastTimestamp = 0;

		var setupCanvasSize = function() {
			pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = Math.floor(width * pixelRatio);
			canvas.height = Math.floor(height * pixelRatio);
			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';
			context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		};

		var createStarSet = function(count, radiusMin, radiusMax, speedScale, alphaMin, alphaMax) {
			var set = [];
			for (var i = 0; i < count; i++) {
				set.push({
					x: Math.random() * width,
					y: Math.random() * height,
					radius: Math.random() * (radiusMax - radiusMin) + radiusMin,
					speedX: (Math.random() - 0.5) * speedScale,
					speedY: Math.random() * speedScale + speedScale * 0.15,
					alpha: Math.random() * (alphaMax - alphaMin) + alphaMin,
					twinkle: Math.random() * Math.PI * 2
				});
			}
			return set;
		};

		var createStars = function() {
			var density = Math.max(80, Math.floor((width * height) / 12000));
			starsFar = createStarSet(Math.floor(density * 0.65), 0.4, 1.1, 0.05, 0.14, 0.35);
			starsNear = createStarSet(Math.floor(density * 0.35), 0.9, 2.2, 0.12, 0.2, 0.5);
			comets = [];
		};

		var spawnComet = function() {
			if (Math.random() > 0.012) {
				return;
			}

			comets.push({
				x: Math.random() * width * 0.7,
				y: -40,
				vx: Math.random() * 1.8 + 1.4,
				vy: Math.random() * 1.4 + 1.2,
				life: 0,
				maxLife: 120 + Math.floor(Math.random() * 70),
				length: 80 + Math.random() * 90
			});
		};

		var drawBackdrop = function(time) {
			var baseGradient = context.createLinearGradient(0, 0, width, height);
			baseGradient.addColorStop(0, '#040b14');
			baseGradient.addColorStop(0.38, '#0a1c31');
			baseGradient.addColorStop(1, '#0e2a3f');
			context.fillStyle = baseGradient;
			context.fillRect(0, 0, width, height);

			var pulse = 0.9 + Math.sin(time * 0.00058) * 0.1;
			var auroraA = context.createRadialGradient(width * 0.12, height * 0.18, 0, width * 0.12, height * 0.18, Math.max(width, height) * 0.6);
			auroraA.addColorStop(0, 'rgba(82, 196, 255,' + (0.14 * pulse).toFixed(3) + ')');
			auroraA.addColorStop(1, 'rgba(8, 24, 44, 0)');
			context.fillStyle = auroraA;
			context.fillRect(0, 0, width, height);

			var auroraB = context.createRadialGradient(width * 0.8, height * 0.22, 0, width * 0.8, height * 0.22, Math.max(width, height) * 0.58);
			auroraB.addColorStop(0, 'rgba(110, 238, 210,' + (0.1 * pulse).toFixed(3) + ')');
			auroraB.addColorStop(1, 'rgba(7, 33, 43, 0)');
			context.fillStyle = auroraB;
			context.fillRect(0, 0, width, height);

			var earthX = width * 0.8;
			var earthY = height * 0.8;
			var earthRadius = Math.max(width, height) * 0.185;

			var atmosphere = context.createRadialGradient(earthX, earthY, earthRadius * 0.6, earthX, earthY, earthRadius * 1.9);
			atmosphere.addColorStop(0, 'rgba(104, 232, 255, 0.26)');
			atmosphere.addColorStop(0.5, 'rgba(61, 154, 231, 0.18)');
			atmosphere.addColorStop(1, 'rgba(24, 76, 124, 0)');
			context.fillStyle = atmosphere;
			context.beginPath();
			context.arc(earthX, earthY, earthRadius * 1.9, 0, Math.PI * 2);
			context.fill();

			var earthGradient = context.createRadialGradient(earthX - earthRadius * 0.35, earthY - earthRadius * 0.4, earthRadius * 0.1, earthX, earthY, earthRadius);
			earthGradient.addColorStop(0, '#8ce7ff');
			earthGradient.addColorStop(0.34, '#36a3de');
			earthGradient.addColorStop(0.72, '#195ca0');
			earthGradient.addColorStop(1, '#0a2748');
			context.fillStyle = earthGradient;
			context.beginPath();
			context.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
			context.fill();

			context.save();
			context.beginPath();
			context.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
			context.clip();

			context.strokeStyle = 'rgba(150, 231, 255, 0.28)';
			context.lineWidth = 1;
			for (var lon = -3; lon <= 3; lon++) {
				context.beginPath();
				context.ellipse(earthX + lon * earthRadius * 0.12, earthY, earthRadius * (0.94 - Math.abs(lon) * 0.11), earthRadius * 0.98, orbitAngle * 0.35, 0, Math.PI * 2);
				context.stroke();
			}

			context.fillStyle = 'rgba(122, 255, 210, 0.2)';
			context.beginPath();
			context.ellipse(earthX - earthRadius * 0.16, earthY - earthRadius * 0.18, earthRadius * 0.28, earthRadius * 0.16, 0.48 + orbitAngle * 0.24, 0, Math.PI * 2);
			context.fill();
			context.beginPath();
			context.ellipse(earthX + earthRadius * 0.16, earthY + earthRadius * 0.09, earthRadius * 0.24, earthRadius * 0.14, -0.35 + orbitAngle * 0.2, 0, Math.PI * 2);
			context.fill();
			context.beginPath();
			context.ellipse(earthX + earthRadius * 0.04, earthY - earthRadius * 0.3, earthRadius * 0.2, earthRadius * 0.11, 0.08 + orbitAngle * 0.18, 0, Math.PI * 2);
			context.fill();

			context.restore();

			var drawSatellite = function(sx, sy, rotation, alpha) {
				context.save();
				context.translate(sx, sy);
				context.rotate(rotation);
				context.globalAlpha = alpha;
				context.fillStyle = '#d8f4ff';
				context.fillRect(-2, -5, 4, 10);
				context.fillStyle = '#7ecfff';
				context.fillRect(-12, -3, 8, 6);
				context.fillRect(4, -3, 8, 6);
				context.strokeStyle = 'rgba(165, 230, 255, 0.45)';
				context.lineWidth = 1;
				context.beginPath();
				context.moveTo(-4, 0);
				context.lineTo(-12, 0);
				context.moveTo(4, 0);
				context.lineTo(12, 0);
				context.stroke();
				context.restore();
			};

			var orbitSets = [
				{ rx: earthRadius * 1.34, ry: earthRadius * 0.66, speed: 0.00078, shift: 0.1 },
				{ rx: earthRadius * 1.16, ry: earthRadius * 0.52, speed: -0.00092, shift: 2.2 },
				{ rx: earthRadius * 1.5, ry: earthRadius * 0.74, speed: 0.00058, shift: 4.15 }
			];

			var satPoints = [];
			context.strokeStyle = 'rgba(120, 214, 255, 0.2)';
			context.lineWidth = 1;
			for (var o = 0; o < orbitSets.length; o++) {
				var orbit = orbitSets[o];
				context.beginPath();
				context.ellipse(earthX, earthY, orbit.rx, orbit.ry, orbitAngle * 0.5 + o * 0.3, 0, Math.PI * 2);
				context.stroke();

				var satAngle = time * orbit.speed + orbit.shift;
				var sx = earthX + Math.cos(satAngle) * orbit.rx;
				var sy = earthY + Math.sin(satAngle) * orbit.ry;
				satPoints.push({ x: sx, y: sy });
				drawSatellite(sx, sy, satAngle + Math.PI * 0.5, 0.92);
			}

			context.strokeStyle = 'rgba(138, 228, 255, 0.22)';
			context.lineWidth = 1;
			for (var n = 0; n < satPoints.length; n++) {
				context.beginPath();
				context.moveTo(satPoints[n].x, satPoints[n].y);
				context.lineTo(earthX, earthY);
				context.stroke();
			}

			var hudX = width * 0.2;
			var hudY = height * 0.3;
			var hudR = Math.max(width, height) * 0.095;
			context.save();
			context.translate(hudX, hudY);
			context.strokeStyle = 'rgba(114, 228, 255, 0.55)';
			context.lineWidth = 1.2;
			context.beginPath();
			context.arc(0, 0, hudR, 0, Math.PI * 2);
			context.stroke();

			context.beginPath();
			context.arc(0, 0, hudR * 0.68, 0, Math.PI * 2);
			context.stroke();

			context.rotate(time * 0.00022);
			context.beginPath();
			context.arc(0, 0, hudR * 0.88, Math.PI * 0.12, Math.PI * 0.52);
			context.stroke();
			context.beginPath();
			context.arc(0, 0, hudR * 0.88, Math.PI * 1.1, Math.PI * 1.46);
			context.stroke();

			context.rotate(-time * 0.00036);
			context.strokeStyle = 'rgba(128, 246, 233, 0.6)';
			context.beginPath();
			context.moveTo(-hudR, 0);
			context.lineTo(hudR, 0);
			context.moveTo(0, -hudR);
			context.lineTo(0, hudR);
			context.stroke();

			context.restore();

			var scanY = (time * 0.06) % (height + 120) - 60;
			var scanGradient = context.createLinearGradient(0, scanY - 12, 0, scanY + 16);
			scanGradient.addColorStop(0, 'rgba(90, 238, 255, 0)');
			scanGradient.addColorStop(0.5, 'rgba(90, 238, 255, 0.18)');
			scanGradient.addColorStop(1, 'rgba(90, 238, 255, 0)');
			context.fillStyle = scanGradient;
			context.fillRect(0, scanY - 12, width, 28);
		};

		var drawSpaceDust = function(time, animated) {
			var driftA = animated ? Math.sin(time * 0.00018) * width * 0.06 : 0;
			var driftB = animated ? Math.cos(time * 0.00014) * height * 0.04 : 0;

			context.save();
			context.globalCompositeOperation = 'screen';

			var hazeA = context.createRadialGradient(width * 0.28 + driftA, height * 0.22 + driftB, 0, width * 0.28 + driftA, height * 0.22 + driftB, Math.max(width, height) * 0.52);
			hazeA.addColorStop(0, 'rgba(116, 208, 255, 0.11)');
			hazeA.addColorStop(1, 'rgba(116, 208, 255, 0)');
			context.fillStyle = hazeA;
			context.fillRect(0, 0, width, height);

			var hazeB = context.createRadialGradient(width * 0.62 - driftA * 0.7, height * 0.56 - driftB * 0.45, 0, width * 0.62 - driftA * 0.7, height * 0.56 - driftB * 0.45, Math.max(width, height) * 0.46);
			hazeB.addColorStop(0, 'rgba(170, 142, 255, 0.08)');
			hazeB.addColorStop(1, 'rgba(170, 142, 255, 0)');
			context.fillStyle = hazeB;
			context.fillRect(0, 0, width, height);

			context.globalCompositeOperation = 'source-over';
			context.strokeStyle = 'rgba(157, 224, 255, 0.12)';
			context.lineWidth = 0.8;
			for (var i = 0; i < 5; i++) {
				var y = height * (0.14 + i * 0.17) + (animated ? Math.sin(time * 0.00025 + i * 0.9) * 12 : 0);
				context.beginPath();
				context.moveTo(-80, y);
				context.quadraticCurveTo(width * 0.34, y + 26, width + 80, y - 10);
				context.stroke();
			}

			context.restore();
		};

		var drawStarLayer = function(stars, animated, time, glowStrength) {
			for (var i = 0; i < stars.length; i++) {
				var star = stars[i];
				if (animated) {
					star.x += star.speedX;
					star.y += star.speedY;

					if (star.y > height + 4) {
						star.y = -4;
						star.x = Math.random() * width;
					}
					if (star.x > width + 4) {
						star.x = -4;
					} else if (star.x < -4) {
						star.x = width + 4;
					}

					star.twinkle += 0.016;
				}

				var twinkleAlpha = star.alpha + Math.sin(time * 0.0012 + star.twinkle) * 0.08;
				context.fillStyle = 'rgba(193, 225, 255, ' + Math.max(0.08, twinkleAlpha).toFixed(3) + ')';
				context.beginPath();
				context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
				context.fill();

				if (glowStrength > 0.001) {
					context.fillStyle = 'rgba(152, 214, 255, ' + glowStrength.toFixed(3) + ')';
					context.beginPath();
					context.arc(star.x, star.y, star.radius * 2.3, 0, Math.PI * 2);
					context.fill();
				}
			}
		};

		var drawComets = function() {
			for (var i = comets.length - 1; i >= 0; i--) {
				var comet = comets[i];
				comet.life += 1;
				comet.x += comet.vx;
				comet.y += comet.vy;

				var lifeRatio = 1 - comet.life / comet.maxLife;
				if (lifeRatio <= 0 || comet.y > height + 60 || comet.x > width + 120) {
					comets.splice(i, 1);
					continue;
				}

				var tailGradient = context.createLinearGradient(comet.x, comet.y, comet.x - comet.length, comet.y - comet.length * 0.4);
				tailGradient.addColorStop(0, 'rgba(212, 238, 255,' + (0.8 * lifeRatio).toFixed(3) + ')');
				tailGradient.addColorStop(1, 'rgba(212, 238, 255,0)');
				context.strokeStyle = tailGradient;
				context.lineWidth = 2;
				context.beginPath();
				context.moveTo(comet.x, comet.y);
				context.lineTo(comet.x - comet.length, comet.y - comet.length * 0.4);
				context.stroke();

				context.fillStyle = 'rgba(245, 252, 255,' + (0.95 * lifeRatio).toFixed(3) + ')';
				context.beginPath();
				context.arc(comet.x, comet.y, 1.9, 0, Math.PI * 2);
				context.fill();
			}
		};

		var renderStatic = function() {
			drawBackdrop(0);
			drawSpaceDust(0, false);
			drawStarLayer(starsFar, false, 0, 0);
			drawStarLayer(starsNear, false, 0, 0);
		};

		var animate = function(timestamp) {
			lastTimestamp = timestamp || lastTimestamp;
			drawBackdrop(lastTimestamp);
			drawSpaceDust(lastTimestamp, true);
			drawStarLayer(starsFar, true, lastTimestamp, 0);
			drawStarLayer(starsNear, true, lastTimestamp, 0.045);
			spawnComet();
			drawComets();
			orbitAngle += 0.0022;
			frameId = window.requestAnimationFrame(animate);
		};

		var start = function() {
			if (frameId) {
				window.cancelAnimationFrame(frameId);
				frameId = null;
			}

			setupCanvasSize();
			createStars();

			if (prefersReducedMotion) {
				renderStatic();
				return;
			}

			animate();
		};

		window.addEventListener('resize', start);

		if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
			mediaQuery.addEventListener('change', function(event) {
				prefersReducedMotion = event.matches;
				start();
			});
		}

		start();
	};

	var fullHeight = function() {

		if ( !isMobile.any() ) {
			$('.js-fullheight').not('#colorlib-aside').css('height', $(window).height());
			$(window).resize(function(){
				$('.js-fullheight').not('#colorlib-aside').css('height', $(window).height());
			});
		}

	};

	var scrollProgress = function() {
		var progressElement = document.getElementById('scroll-progress');
		if (!progressElement) {
			return;
		}

		var updateProgress = function() {
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
			var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
			var percentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
			progressElement.value = Math.min(Math.max(percentage, 0), 100);
		};

		updateProgress();
		window.addEventListener('scroll', updateProgress, { passive: true });
		window.addEventListener('resize', updateProgress);
	};


	var counter = function() {
		$('.js-counter').countTo({
			 formatter: function (value, options) {
	      return value.toFixed(options.decimals);
	    },
		});
	};


	var counterWayPoint = function() {
		if ($('#colorlib-counter').length > 0 ) {
			$('#colorlib-counter').waypoint( function( direction ) {
										
				if( direction === 'down' && !$(this.element).hasClass('animated') ) {
					setTimeout( counter , 400);					
					$(this.element).addClass('animated');
				}
			} , { offset: '90%' } );
		}
	};

	// Animations
	var contentWayPoint = function() {
		var i = 0;
		$('.animate-box').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('animated') ) {
				
				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function(){

					$('body .animate-box.item-animate').each(function(k){
						var el = $(this);
						setTimeout( function () {
							var effect = el.data('animate-effect');
							if ( effect === 'fadeIn') {
								el.addClass('fadeIn animated');
							} else if ( effect === 'fadeInLeft') {
								el.addClass('fadeInLeft animated');
							} else if ( effect === 'fadeInRight') {
								el.addClass('fadeInRight animated');
							} else {
								el.addClass('fadeInUp animated');
							}

							el.removeClass('item-animate');
						},  k * 200, 'easeInOutExpo' );
					});
					
				}, 100);
				
			}

		} , { offset: '85%' } );
	};


	var burgerMenu = function() {
		var $toggle = $('.js-colorlib-nav-toggle');
		var $menu = $('#navbar');
		var $aside = $('#colorlib-aside');
		var lastFocusedElement = null;
		var focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

		var closeMenu = function(restoreFocus) {
			$('body').removeClass('offcanvas');
			$toggle.removeClass('active').attr('aria-expanded', 'false');
			$menu.attr('aria-hidden', 'true');

			if (restoreFocus && lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
				lastFocusedElement.focus();
			}
		};

		var openMenu = function() {
			lastFocusedElement = document.activeElement;
			$('body').addClass('offcanvas');
			$toggle.addClass('active').attr('aria-expanded', 'true');
			$menu.attr('aria-hidden', 'false');

			setTimeout(function() {
				var focusables = $aside.find(focusableSelector).filter(':visible');
				if (focusables.length) {
					focusables.first().focus();
				}
			}, 10);
		};

		$toggle.attr('aria-expanded', 'false');
		$menu.attr('aria-hidden', 'true');

		$('.js-colorlib-nav-toggle').on('click', function(event){
			event.preventDefault();
			var $this = $(this);

			if ($('body').hasClass('offcanvas')) {
				closeMenu(false);
			} else {
				$this.focus();
				openMenu();
			}
		});

		$toggle.on('keydown', function(event) {
			if (event.key === ' ' || event.key === 'Enter') {
				event.preventDefault();
				$toggle.trigger('click');
			}
		});

		$(document).on('keydown', function(event) {
			if (event.key === 'Escape' && $('body').hasClass('offcanvas')) {
				closeMenu(true);
			}

			if (event.key !== 'Tab' || !$('body').hasClass('offcanvas')) {
				return;
			}

			var focusables = $aside.find(focusableSelector).filter(':visible');
			if (!focusables.length) {
				return;
			}

			var first = focusables.first()[0];
			var last = focusables.last()[0];

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		});



	};

	// Click outside of offcanvass
	var mobileMenuOutsideClick = function() {

		$(document).click(function (e) {
	    var container = $("#colorlib-aside, .js-colorlib-nav-toggle");
	    if (!container.is(e.target) && container.has(e.target).length === 0) {

	    	if ( $('body').hasClass('offcanvas') ) {

	    		$('body').removeClass('offcanvas');
	    		$('.js-colorlib-nav-toggle').removeClass('active').attr('aria-expanded', 'false');
	    		$('#navbar').attr('aria-hidden', 'true');
			
	    	}
	    	
	    }
		});

		$(window).scroll(function(){
			if ( $('body').hasClass('offcanvas') ) {

	    		$('body').removeClass('offcanvas');
	    		$('.js-colorlib-nav-toggle').removeClass('active').attr('aria-expanded', 'false');
	    		$('#navbar').attr('aria-hidden', 'true');
			
	    	}
		});

	};

	var clickMenu = function() {

		var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		$('#navbar a:not([class="external"])').click(function(event){
			var section = $(this).data('nav-section'),
				navbar = $('#navbar'),
				$target = $('[data-section="' + section + '"]');

				if ( $target.length ) {
					var topNavOffset = $(window).width() <= 992 ? 55 : 24;
					var targetTop = $target.offset().top - topNavOffset;

					if ('scrollBehavior' in document.documentElement.style) {
						window.scrollTo({
							top: targetTop,
							behavior: reduceMotion ? 'auto' : 'smooth'
						});
					} else {
						$('html, body').animate({ scrollTop: targetTop }, reduceMotion ? 0 : 500);
					}
			   }

		    if ( navbar.is(':visible')) {
		    	navbar.removeClass('in');
		    	navbar.attr('aria-expanded', 'false');
		    	$('.js-colorlib-nav-toggle').removeClass('active').attr('aria-expanded', 'false');
		    	$('body').removeClass('offcanvas');
		    	$('#navbar').attr('aria-hidden', 'true');
		    }

		    event.preventDefault();
		    return false;
		});


	};

	var lightweightReveal = function() {
		var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var revealTargets = document.querySelectorAll(
			'.section-header, .services, .blog-entry, .timeline-label, .colorlib-feature, .project, .hire, #colorlib-counter .col-md-3'
		);

		if (!revealTargets.length) {
			return;
		}

		revealTargets.forEach(function(element) {
			element.classList.add('reveal-ready');
		});

		if (reduceMotion || !('IntersectionObserver' in window)) {
			revealTargets.forEach(function(element) {
				element.classList.add('reveal-visible');
				element.classList.remove('reveal-ready');
			});
			return;
		}

		var observer = new IntersectionObserver(function(entries, obs) {
			entries.forEach(function(entry) {
				if (!entry.isIntersecting) {
					return;
				}

				entry.target.classList.add('reveal-visible');
				entry.target.classList.remove('reveal-ready');
				obs.unobserve(entry.target);
			});
		}, {
			root: null,
			threshold: 0.12,
			rootMargin: '0px 0px -8% 0px'
		});

		revealTargets.forEach(function(element) {
			observer.observe(element);
		});
	};

	var motionExperience = function() {
		var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var coarsePointer = window.matchMedia('(pointer: coarse)').matches;
		var choreoTargets = document.querySelectorAll('#colorlib-main section, #colorlib-counter, .timeline-centered, .project-premium, #colorlib-counter .col-md-3');
		var delayedItems = document.querySelectorAll('.section-shell .colorlib-heading, .services, .timeline-label, .project-premium, .colorlib-feature, #colorlib-counter .col-md-3, .blog-entry');
		var tiltTargets = document.querySelectorAll('.services, .timeline-label, .project-premium, .colorlib-feature, #colorlib-counter .col-md-3, .hire');

		if (!choreoTargets.length) {
			return;
		}

		delayedItems.forEach(function(element, index) {
			element.style.setProperty('--motion-delay', ((index % 8) * 70) + 'ms');
		});

		var activateTarget = function(element) {
			element.classList.add('motion-in-view');
		};

		if (reduceMotion || !('IntersectionObserver' in window)) {
			choreoTargets.forEach(activateTarget);
		} else {
			var observer = new IntersectionObserver(function(entries, obs) {
				entries.forEach(function(entry) {
					if (!entry.isIntersecting) {
						return;
					}

					activateTarget(entry.target);
					obs.unobserve(entry.target);
				});
			}, {
				root: null,
				threshold: 0.16,
				rootMargin: '0px 0px -10% 0px'
			});

			choreoTargets.forEach(function(element) {
				observer.observe(element);
			});
		}

		if (reduceMotion || coarsePointer) {
			return;
		}

		tiltTargets.forEach(function(element) {
			element.classList.add('motion-tilt');
			var frameId = null;
			var resetTimer = null;

			var updateTilt = function(clientX, clientY) {
				var rect = element.getBoundingClientRect();
				if (!rect.width || !rect.height) {
					return;
				}

				var x = (clientX - rect.left) / rect.width;
				var y = (clientY - rect.top) / rect.height;
				var tiltX = ((0.5 - y) * 8).toFixed(2) + 'deg';
				var tiltY = ((x - 0.5) * 10).toFixed(2) + 'deg';

				element.style.setProperty('--tilt-x', tiltX);
				element.style.setProperty('--tilt-y', tiltY);
				element.style.setProperty('--glow-x', (x * 100).toFixed(2) + '%');
				element.style.setProperty('--glow-y', (y * 100).toFixed(2) + '%');
				element.classList.add('tilt-active');
			};

			element.addEventListener('pointermove', function(event) {
				if (frameId) {
					window.cancelAnimationFrame(frameId);
				}
				frameId = window.requestAnimationFrame(function() {
					updateTilt(event.clientX, event.clientY);
				});
			}, { passive: true });

			var resetTilt = function() {
				if (resetTimer) {
					window.clearTimeout(resetTimer);
				}
				resetTimer = window.setTimeout(function() {
					element.style.setProperty('--tilt-x', '0deg');
					element.style.setProperty('--tilt-y', '0deg');
					element.style.setProperty('--glow-x', '50%');
					element.style.setProperty('--glow-y', '50%');
					element.classList.remove('tilt-active');
				}, 120);
			};

			element.addEventListener('pointerleave', resetTilt);
			element.addEventListener('blur', resetTilt, true);
		});
	};

	// Reflect scrolling in navigation
	var navActive = function(section) {

		var $menu = $('#navbar > ul');
		$menu.find('li').removeClass('active');
		$menu.find('a').removeAttr('aria-current');
		var $activeLink = $menu.find('a[data-nav-section="'+section+'"]');
		$activeLink.closest('li').addClass('active');
		$activeLink.attr('aria-current', 'page');

	};

	var navigationSection = function() {

		var $section = $('section[data-section]');

		if (!$section.length) {
			return;
		}

		var updateActiveSection = function() {
			var scrollPosition = $(window).scrollTop() + 140;
			var currentSection = $section.first().data('section');

			$section.each(function() {
				if ($(this).offset().top <= scrollPosition) {
					currentSection = $(this).data('section');
				}
			});

			navActive(currentSection);
		};

		updateActiveSection();
		$(window).on('scroll', updateActiveSection);
		$(window).on('resize', updateActiveSection);

	};






	var sliderMain = function() {
		
	  	$('#colorlib-hero .flexslider').flexslider({
			animation: "fade",
			slideshowSpeed: 5000,
			directionNav: true,
			start: function(){
				setTimeout(function(){
					$('.slider-text').removeClass('animated fadeInUp');
					$('.flex-active-slide').find('.slider-text').addClass('animated fadeInUp');
				}, 500);
			},
			before: function(){
				setTimeout(function(){
					$('.slider-text').removeClass('animated fadeInUp');
					$('.flex-active-slide').find('.slider-text').addClass('animated fadeInUp');
				}, 500);
			}

	  	});

	};

	var stickyFunction = function() {

		var h = $('.image-content').outerHeight();

		if ($(window).width() <= 992 ) {
			$("#sticky_item").trigger("sticky_kit:detach");
		} else {
			$('.sticky-parent').removeClass('stick-detach');
			$("#sticky_item").trigger("sticky_kit:detach");
			$("#sticky_item").trigger("sticky_kit:unstick");
		}

		$(window).resize(function(){
			var h = $('.image-content').outerHeight();
			$('.sticky-parent').css('height', h);


			if ($(window).width() <= 992 ) {
				$("#sticky_item").trigger("sticky_kit:detach");
			} else {
				$('.sticky-parent').removeClass('stick-detach');
				$("#sticky_item").trigger("sticky_kit:detach");
				$("#sticky_item").trigger("sticky_kit:unstick");

				$("#sticky_item").stick_in_parent();
			}
			

			

		});

		$('.sticky-parent').css('height', h);

		$("#sticky_item").stick_in_parent();

	};

	var owlCrouselFeatureSlide = function() {
		$('.owl-carousel').owlCarousel({
			animateOut: 'fadeOut',
		   animateIn: 'fadeIn',
		   autoplay: true,
		   loop:true,
		   margin:0,
		   nav:true,
		   dots: false,
		   autoHeight: true,
		   items: 1,
		   navText: [
		      "<i class='icon-arrow-left3 owl-direction'></i>",
		      "<i class='icon-arrow-right3 owl-direction'></i>"
	     	]
		})
	};

	// Document on load.
	$(function(){
		backgroundCanvas();
		scrollProgress();
		fullHeight();
		counter();
		counterWayPoint();
		contentWayPoint();
		burgerMenu();

		clickMenu();
		// navActive();
		navigationSection();
		// windowScroll();


		mobileMenuOutsideClick();
		sliderMain();
		stickyFunction();
		owlCrouselFeatureSlide();
		lightweightReveal();
		motionExperience();
	});


}());