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

		var appState = {
			reduceMotion: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
			coarsePointer: window.matchMedia && window.matchMedia('(pointer: coarse)').matches,
			lowPowerDevice: (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4),
			activeProjectIndex: -1
		};

		if (window.matchMedia) {
			var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			if (typeof reduceMotionQuery.addEventListener === 'function') {
				reduceMotionQuery.addEventListener('change', function(event) {
					appState.reduceMotion = event.matches;
				});
			}
		}

		var safeStorage = {
			get: function(key) {
				try {
					return localStorage.getItem(key);
				} catch (error) {
					return null;
				}
			},
			set: function(key, value) {
				try {
					localStorage.setItem(key, value);
				} catch (error) {
					// no-op
				}
			}
		};

		var withViewTransition = function(callback) {
			if (appState.reduceMotion || typeof callback !== 'function') {
				callback();
				return;
			}
			if (document.startViewTransition) {
				document.startViewTransition(callback);
				return;
			}
			callback();
		};

		var ensureLiveRegion = function() {
			var live = document.getElementById('app-live-region');
			if (live) {
				return live;
			}
			live = document.createElement('div');
			live.id = 'app-live-region';
			live.setAttribute('aria-live', 'polite');
			live.setAttribute('aria-atomic', 'true');
			live.style.position = 'absolute';
			live.style.width = '1px';
			live.style.height = '1px';
			live.style.padding = '0';
			live.style.margin = '-1px';
			live.style.overflow = 'hidden';
			live.style.clip = 'rect(0, 0, 0, 0)';
			document.body.appendChild(live);
			return live;
		};

		var announce = function(message) {
			var live = ensureLiveRegion();
			live.textContent = '';
			window.setTimeout(function() {
				live.textContent = message;
			}, 20);
		};

	var themeController = function() {
		var storageKey = 'bp-theme';
		var themeButtons = document.querySelectorAll('.js-theme-swatch');
		var themes = ['slate', 'aurora', 'paper', 'hc'];
		var themeLabels = {
			slate: 'Professional Slate',
			aurora: 'Aurora Flux',
			paper: 'Paper Serif',
			hc: 'High Contrast'
		};

		if (!themeButtons.length) {
			return;
		}

		var getSavedTheme = function() {
			var value = safeStorage.get(storageKey);
			return themes.indexOf(value) > -1 ? value : null;
		};

		var getSystemFallback = function() {
			return 'hc';
		};

		var updateButtons = function(theme) {
			themeButtons.forEach(function(button) {
				var option = button.getAttribute('data-theme-option');
				var isActive = option === theme;
				button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
				button.classList.toggle('active', isActive);
				button.setAttribute('aria-label', themeLabels[option] + (isActive ? ' (active)' : ''));
			});
		};

		var applyTheme = function(theme, persistPreference) {
			withViewTransition(function() {
				document.documentElement.setAttribute('data-theme', theme);
				updateButtons(theme);
			});
			document.dispatchEvent(new CustomEvent('app:theme-change', { detail: { theme: theme } }));

			if (persistPreference) {
				safeStorage.set(storageKey, theme);
			}
		};

		var initialTheme = getSavedTheme() || getSystemFallback();
		applyTheme(initialTheme, false);

		themeButtons.forEach(function(button) {
			button.addEventListener('click', function() {
				var requestedTheme = button.getAttribute('data-theme-option');
				if (themes.indexOf(requestedTheme) === -1) {
					return;
				}
				applyTheme(requestedTheme, true);
			});
		});
	};

	var backgroundCanvas = function() {
		var canvas = document.getElementById('bg');
		if (!canvas || !canvas.getContext) {
			return;
		}

		var context = canvas.getContext('2d');
		var mediaQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
		var prefersReducedMotion = mediaQuery ? mediaQuery.matches : false;
		var particles = [];
		var frameId = null;
		var width = 0;
		var height = 0;
		var pixelRatio = 1;
		var currentTheme = document.documentElement.getAttribute('data-theme') || 'slate';
		var pointerShift = { x: 0, y: 0 };
		var maxPointerShift = 3.2;
		var effectiveFps = 24;
		var frameBudget = 1000 / effectiveFps;
		var lastTimestamp = 0;
		var perfLastSecond = 0;
		var perfFrames = 0;
		var lowFpsHits = 0;
		var autoDowngraded = false;
		var inStaticMode = false;
		var qualityScalar = 1;

		var themeSettings = {
			slate: { baseA: [12, 16, 24], baseB: [17, 28, 40], glow: [118, 184, 232], glowAlpha: 0.14, drift: 0.85, particleAlpha: 0.22 },
			aurora: { baseA: [13, 11, 28], baseB: [21, 16, 46], glow: [108, 255, 214], glowAlpha: 0.18, drift: 0.98, particleAlpha: 0.25 },
			neon: { baseA: [8, 15, 24], baseB: [10, 30, 38], glow: [112, 242, 220], glowAlpha: 0.2, drift: 1.1, particleAlpha: 0.27 },
			paper: { baseA: [245, 242, 235], baseB: [238, 232, 222], glow: [169, 141, 104], glowAlpha: 0.06, drift: 0.2, particleAlpha: 0.1 },
			hc: { baseA: [2, 2, 2], baseB: [8, 8, 8], glow: [0, 229, 255], glowAlpha: 0.12, drift: 0.45, particleAlpha: 0.2 }
		};

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

		var createParticles = function(count) {
			var base = [];
			for (var i = 0; i < count; i++) {
				base.push({
					x: Math.random() * width,
					y: Math.random() * height,
					radius: Math.random() * 1.4 + 0.4,
					speedX: (Math.random() - 0.5) * 0.06,
					speedY: Math.random() * 0.08 + 0.02,
					alpha: Math.random() * 0.35 + 0.1,
					twinkle: Math.random() * Math.PI * 2
				});
			}
			return base;
		};

		var computeMode = function() {
			return prefersReducedMotion;
		};

		var getThemeProfile = function() {
			return themeSettings[currentTheme] || themeSettings.slate;
		};

		var computeParticleCount = function() {
			var profile = getThemeProfile();
			var baseByMotion = 96;
			if (profile === themeSettings.paper) {
				baseByMotion = 34;
			}
			if (isMobile.any() || appState.lowPowerDevice) {
				baseByMotion = Math.floor(baseByMotion * 0.45);
			}
			return Math.max(16, Math.floor(baseByMotion * qualityScalar));
		};

		var rebuild = function() {
			particles = createParticles(computeParticleCount());
		};

		var drawBackdrop = function(time, animated) {
			var profile = getThemeProfile();
			var driftStrength = animated ? profile.drift : 0;
			var waveX = Math.sin(time * 0.00012) * width * 0.03 * driftStrength;
			var waveY = Math.cos(time * 0.00009) * height * 0.025 * driftStrength;
			var px = appState.coarsePointer ? 0 : pointerShift.x;
			var py = appState.coarsePointer ? 0 : pointerShift.y;

			var gradient = context.createLinearGradient(
				0 + waveX + px,
				0 + waveY + py,
				width - waveX - px,
				height - waveY - py
			);
			gradient.addColorStop(0, 'rgb(' + profile.baseA.join(',') + ')');
			gradient.addColorStop(1, 'rgb(' + profile.baseB.join(',') + ')');
			context.fillStyle = gradient;
			context.fillRect(0, 0, width, height);

			var auraX = width * 0.28 + waveX * 0.45 + px;
			var auraY = height * 0.22 + waveY * 0.4 + py;
			var aura = context.createRadialGradient(auraX, auraY, 0, auraX, auraY, Math.max(width, height) * 0.55);
			aura.addColorStop(0, 'rgba(' + profile.glow.join(',') + ',' + profile.glowAlpha.toFixed(3) + ')');
			aura.addColorStop(1, 'rgba(' + profile.glow.join(',') + ',0)');
			context.fillStyle = aura;
			context.fillRect(0, 0, width, height);
		};

		var drawParticles = function(time, animated) {
			var profile = getThemeProfile();
			for (var i = 0; i < particles.length; i++) {
				var particle = particles[i];
				if (animated) {
					particle.x += particle.speedX;
					particle.y += particle.speedY;
					particle.twinkle += 0.01;

					if (particle.y > height + 3) {
						particle.y = -3;
						particle.x = Math.random() * width;
					}
					if (particle.x > width + 3) {
						particle.x = -3;
					}
					if (particle.x < -3) {
						particle.x = width + 3;
					}
				}

				var alpha = Math.max(0.04, (particle.alpha + Math.sin(time * 0.001 + particle.twinkle) * 0.04) * profile.particleAlpha);
				context.fillStyle = 'rgba(210,230,255,' + alpha.toFixed(3) + ')';
				context.beginPath();
				context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
				context.fill();
			}
		};

		var renderStatic = function() {
			drawBackdrop(0, false);
			drawParticles(0, false);
		};

		var maybeDegradeForPerformance = function(now) {
			if (!perfLastSecond) {
				perfLastSecond = now;
				return;
			}
			perfFrames += 1;
			if (now - perfLastSecond < 1000) {
				return;
			}
			var fps = (perfFrames * 1000) / (now - perfLastSecond);
			perfFrames = 0;
			perfLastSecond = now;
			if (fps < 18) {
				lowFpsHits += 1;
			} else {
				lowFpsHits = 0;
			}
			if (lowFpsHits >= 2 && !autoDowngraded) {
				autoDowngraded = true;
				qualityScalar = 0.6;
				effectiveFps = 24;
				frameBudget = 1000 / effectiveFps;
				rebuild();
			}
			if (lowFpsHits >= 4) {
				inStaticMode = true;
			}
		};

		var animate = function(timestamp) {
			var now = timestamp || 0;
			if (document.hidden) {
				return;
			}
			if (inStaticMode) {
				renderStatic();
				return;
			}
			if (lastTimestamp && now - lastTimestamp < frameBudget) {
				frameId = window.requestAnimationFrame(animate);
				return;
			}
			lastTimestamp = now;
			drawBackdrop(now, true);
			drawParticles(now, true);
			maybeDegradeForPerformance(now);
			frameId = window.requestAnimationFrame(animate);
		};

		var start = function() {
			if (frameId) {
				window.cancelAnimationFrame(frameId);
				frameId = null;
			}

			lastTimestamp = 0;
			perfFrames = 0;
			perfLastSecond = 0;
			lowFpsHits = 0;
			autoDowngraded = false;
			inStaticMode = false;
			setupCanvasSize();
			qualityScalar = (isMobile.any() || appState.lowPowerDevice) ? 0.58 : 1;
			effectiveFps = (isMobile.any() || appState.lowPowerDevice) ? 24 : 30;
			frameBudget = 1000 / effectiveFps;
			rebuild();

			canvas.style.display = 'block';
			if (computeMode()) {
				inStaticMode = true;
				renderStatic();
				return;
			}

			frameId = window.requestAnimationFrame(animate);
		};

		window.addEventListener('resize', function() {
			window.requestAnimationFrame(start);
		});

		if (!appState.coarsePointer) {
			window.addEventListener('pointermove', function(event) {
				var nx = (event.clientX / Math.max(window.innerWidth, 1)) - 0.5;
				var ny = (event.clientY / Math.max(window.innerHeight, 1)) - 0.5;
				pointerShift.x = nx * maxPointerShift * 2;
				pointerShift.y = ny * maxPointerShift * 2;
			}, { passive: true });

			window.addEventListener('pointerleave', function() {
				pointerShift.x = 0;
				pointerShift.y = 0;
			});
		}

		if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
			mediaQuery.addEventListener('change', function(event) {
				prefersReducedMotion = event.matches;
				start();
			});
		}

		document.addEventListener('visibilitychange', function() {
			if (document.hidden) {
				if (frameId) {
					window.cancelAnimationFrame(frameId);
					frameId = null;
				}
				return;
			}
			start();
		});

		document.addEventListener('app:theme-change', function(event) {
			currentTheme = event.detail && event.detail.theme ? event.detail.theme : 'slate';
			start();
		});

		start();
	};
	var fullHeight = function() {

		if ( !isMobile.any() ) {
			var applyHeroHeight = function() {
				var heroHeight = Math.max($(window).height(), 560);
				$('#bp-hero, #bp-hero .flexslider, #bp-hero .slides, #bp-hero .slides > li').css('min-height', heroHeight + 'px');
			};
			applyHeroHeight();
			$(window).resize(function(){
				applyHeroHeight();
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
		if ($('#bp-counter').length > 0 ) {
			$('#bp-counter').waypoint( function( direction ) {
										
				if( direction === 'down' && !$(this.element).hasClass('animated') ) {
					setTimeout( counter , 400);					
					$(this.element).addClass('animated');
				}
			} , { offset: '90%' } );
		}
	};

	// Animations
	var contentWayPoint = function() {
		var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (reduceMotion) {
			$('.reveal-item').css('opacity', '1').addClass('animated');
			return;
		}

		var i = 0;
		$('.reveal-item').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('animated') ) {
				
				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function(){

					$('body .reveal-item.item-animate').each(function(k){
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
		var $toggle = $('.js-bp-nav-toggle');
		var $menu = $('#bp-navbar');
		var $aside = $('#bp-aside');
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

		$('.js-bp-nav-toggle').on('click', function(event){
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
	    var container = $("#bp-aside, .js-bp-nav-toggle");
	    if (!container.is(e.target) && container.has(e.target).length === 0) {

	    	if ( $('body').hasClass('offcanvas') ) {

	    		$('body').removeClass('offcanvas');
	    		$('.js-bp-nav-toggle').removeClass('active').attr('aria-expanded', 'false');
	    		$('#bp-navbar').attr('aria-hidden', 'true');
			
	    	}
	    	
	    }
		});

		$(window).scroll(function(){
			if ( $('body').hasClass('offcanvas') ) {

	    		$('body').removeClass('offcanvas');
	    		$('.js-bp-nav-toggle').removeClass('active').attr('aria-expanded', 'false');
	    		$('#bp-navbar').attr('aria-hidden', 'true');
			
	    	}
		});

	};

	var clickMenu = function() {

		var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		$('#bp-navbar a:not([class="external"])').click(function(event){
			var section = $(this).data('nav-section'),
				navbar = $('#bp-navbar'),
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
		    	$('.js-bp-nav-toggle').removeClass('active').attr('aria-expanded', 'false');
		    	$('body').removeClass('offcanvas');
		    	$('#bp-navbar').attr('aria-hidden', 'true');
		    }

		    event.preventDefault();
		    return false;
		});


	};

	var lightweightReveal = function() {
		var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var sections = document.querySelectorAll('.section-shell');

		if (!sections.length) {
			return;
		}

		var selector = '.section-header, .card, .services, .timeline-entry, .blog-entry, .bp-feature, .project, .metrics-card, .impact-metric-card, #bp-counter .col-md-3';

		sections.forEach(function(section) {
			var revealItems = section.querySelectorAll(selector);
			revealItems.forEach(function(item, index) {
				item.classList.add('reveal-ready');
				item.style.setProperty('--reveal-delay', ((index % 8) * 70) + 'ms');
			});
		});

		if (reduceMotion || !('IntersectionObserver' in window)) {
			sections.forEach(function(section) {
				section.classList.add('section-in-view');
				section.querySelectorAll(selector).forEach(function(item) {
					item.classList.add('reveal-visible');
					item.classList.remove('reveal-ready');
				});
			});
			return;
		}

		var observer = new IntersectionObserver(function(entries, obs) {
			entries.forEach(function(entry) {
				if (!entry.isIntersecting) {
					return;
				}

				entry.target.classList.add('section-in-view');
				entry.target.querySelectorAll(selector).forEach(function(item) {
					item.classList.add('reveal-visible');
					item.classList.remove('reveal-ready');
				});
				obs.unobserve(entry.target);
			});
		}, {
			root: null,
			threshold: 0.16,
			rootMargin: '0px 0px -10% 0px'
		});

		sections.forEach(function(section) {
			observer.observe(section);
		});
	};

	var motionExperience = function() {
		var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var coarsePointer = window.matchMedia('(pointer: coarse)').matches;
		var choreoTargets = document.querySelectorAll('#bp-main section, #bp-counter, .timeline-centered, .project-premium, .impact-metric-card, #bp-counter .col-md-3');
		var delayedItems = document.querySelectorAll('.section-shell .bp-heading, .services, .timeline-label, .project-premium, .bp-feature, .impact-metric-card, #bp-counter .col-md-3, .blog-entry');
		var tiltTargets = document.querySelectorAll('.services, .timeline-label, .project-premium, .bp-feature, .impact-metric-card, #bp-counter .col-md-3, .hire');

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

		var $menu = $('#bp-navbar > ul');
		$menu.find('li').removeClass('active');
		$menu.find('a').removeAttr('aria-current');
		var $activeLink = $menu.find('a[data-nav-section="'+section+'"]');
		$activeLink.closest('li').addClass('active');
		$activeLink.attr('aria-current', 'page');

	};

	var navigationSection = function() {
		var sections = document.querySelectorAll('section[data-section]');
		if (!sections.length) {
			return;
		}

		if (!('IntersectionObserver' in window)) {
			var $section = $('section[data-section]');
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
			return;
		}

		var observer = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
				if (!entry.isIntersecting) {
					return;
				}

				var activeSection = entry.target.getAttribute('data-section');
				sections.forEach(function(section) {
					section.classList.remove('section-current');
				});
				entry.target.classList.add('section-current');
				entry.target.classList.add('section-entered');
				navActive(activeSection);
				document.dispatchEvent(new CustomEvent('app:section-change', { detail: { section: activeSection } }));
			});
		}, {
			root: null,
			threshold: 0.45,
			rootMargin: '-18% 0px -45% 0px'
		});

		sections.forEach(function(section) {
			observer.observe(section);
		});

	};

	var projectExplorer = function() {
		var controls = document.querySelectorAll('.project-filter-btn');
		var searchInput = document.getElementById('project-search');
		var cards = document.querySelectorAll('.project-premium');
		var status = document.getElementById('project-results-status');
		var emptyState = document.getElementById('project-empty-state');
		var activeFilter = safeStorage.get('bp-project-filter') || 'all';
		var activeQuery = '';
		var cardList = Array.prototype.slice.call(cards);
		var navIndex = -1;

		if (!controls.length || !cards.length || !searchInput) {
			return;
		}

		var normalize = function(value) {
			return (value || '').toLowerCase().trim();
		};

		var matchesQuery = function(searchable, query) {
			if (!query) {
				return true;
			}
			var terms = query.split(/\s+/).filter(Boolean);
			return terms.every(function(term) {
				return searchable.indexOf(term) > -1;
			});
		};

		var setURLState = function() {
			var url = new URL(window.location.href);
			if (activeFilter && activeFilter !== 'all') {
				url.searchParams.set('tag', activeFilter);
			} else {
				url.searchParams.delete('tag');
			}
			if (activeQuery) {
				url.searchParams.set('search', activeQuery);
			} else {
				url.searchParams.delete('search');
			}
			window.history.replaceState({}, '', url.toString());
		};

		var setActiveCard = function(index) {
			cardList.forEach(function(card, idx) {
				card.classList.toggle('project-keyboard-active', idx === index);
			});
			navIndex = index;
			appState.activeProjectIndex = index;
		};

		var highlightProjectTitle = function(card, query) {
			var headingLink = card.querySelector('.desc h3 a');
			if (!headingLink) {
				return;
			}
			var base = headingLink.getAttribute('data-base-title') || headingLink.textContent;
			if (!headingLink.getAttribute('data-base-title')) {
				headingLink.setAttribute('data-base-title', base);
			}
			if (!query) {
				headingLink.innerHTML = base;
				return;
			}
			var lowerBase = base.toLowerCase();
			var lowerQuery = query.toLowerCase();
			var start = lowerBase.indexOf(lowerQuery);
			if (start === -1) {
				headingLink.innerHTML = base;
				return;
			}
			var end = start + lowerQuery.length;
			headingLink.innerHTML = base.slice(0, start) + '<mark>' + base.slice(start, end) + '</mark>' + base.slice(end);
		};

		var applyFilters = function(applyTransition) {
			var query = normalize(searchInput.value);
			activeQuery = query;
			var visibleCount = 0;

			cards.forEach(function(card) {
				var categories = normalize(card.getAttribute('data-project-category')).split(/\s+/).filter(Boolean);
				var searchable = normalize(card.getAttribute('data-project-search') + ' ' + card.textContent);
				var matchCategory = activeFilter === 'all' || categories.indexOf(activeFilter) > -1;
				var matchQuery = matchesQuery(searchable, query);
				var isVisible = matchCategory && matchQuery;

				card.hidden = !isVisible;
				card.classList.toggle('project-hidden', !isVisible);
				if (isVisible) {
					visibleCount += 1;
				}
				highlightProjectTitle(card, query);
			});
			cardList = Array.prototype.slice.call(cards).filter(function(card) {
				return !card.hidden;
			});
			setActiveCard(cardList.length ? 0 : -1);

			if (status) {
				status.textContent = 'Showing ' + visibleCount + ' of ' + cards.length + ' projects.';
			}

			if (emptyState) {
				emptyState.hidden = visibleCount > 0;
			}

			setURLState();
			safeStorage.set('bp-project-filter', activeFilter);
			safeStorage.set('bp-project-search', activeQuery);
			if (applyTransition) {
				announce('Projects updated. ' + visibleCount + ' shown.');
			}
		};

		controls.forEach(function(button) {
			button.addEventListener('click', function() {
				activeFilter = button.getAttribute('data-project-filter') || 'all';
				controls.forEach(function(control) {
					var isActive = control === button;
					control.classList.toggle('active', isActive);
					control.setAttribute('aria-pressed', isActive ? 'true' : 'false');
				});
				withViewTransition(function() {
					applyFilters(true);
				});
			});
		});

		searchInput.addEventListener('input', function() {
			applyFilters(false);
		});

		searchInput.addEventListener('keydown', function(event) {
			if (event.key === 'Enter') {
				event.preventDefault();
				return;
			}
			if (!cardList.length) {
				return;
			}
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				setActiveCard(Math.min(navIndex + 1, cardList.length - 1));
				cardList[navIndex].scrollIntoView({ block: 'nearest' });
			}
			if (event.key === 'ArrowUp') {
				event.preventDefault();
				setActiveCard(Math.max(navIndex - 1, 0));
				cardList[navIndex].scrollIntoView({ block: 'nearest' });
			}
		});

		var url = new URL(window.location.href);
		var requestedTag = normalize(url.searchParams.get('tag'));
		var requestedSearch = normalize(url.searchParams.get('search'));
		if (requestedTag) {
			activeFilter = requestedTag;
		}
		var savedSearch = normalize(safeStorage.get('bp-project-search') || '');
		searchInput.value = requestedSearch || savedSearch;

		controls.forEach(function(control) {
			var isActive = (control.getAttribute('data-project-filter') || 'all') === activeFilter;
			control.classList.toggle('active', isActive);
			control.setAttribute('aria-pressed', isActive ? 'true' : 'false');
		});

		applyFilters(false);
	};

	var copyContactValues = function() {
		var buttons = document.querySelectorAll('.copy-btn');
		var toastHost = document.getElementById('app-toast-host');

		if (!buttons.length) {
			return;
		}

		if (!toastHost) {
			toastHost = document.createElement('div');
			toastHost.id = 'app-toast-host';
			toastHost.style.position = 'fixed';
			toastHost.style.right = '16px';
			toastHost.style.bottom = '16px';
			toastHost.style.zIndex = '2200';
			toastHost.style.display = 'grid';
			toastHost.style.gap = '8px';
			document.body.appendChild(toastHost);
		}

		var showToast = function(message, isError) {
			var toast = document.createElement('div');
			toast.textContent = message;
			toast.style.padding = '10px 12px';
			toast.style.borderRadius = '10px';
			toast.style.border = '1px solid rgba(255,255,255,0.2)';
			toast.style.background = isError ? 'rgba(120, 20, 20, 0.92)' : 'rgba(11, 20, 32, 0.94)';
			toast.style.color = '#fff';
			toast.style.fontSize = '13px';
			toast.style.boxShadow = '0 10px 24px rgba(0,0,0,0.26)';
			toastHost.appendChild(toast);
			window.setTimeout(function() {
				toast.remove();
			}, 1600);
		};

		var writeText = function(text) {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				return navigator.clipboard.writeText(text);
			}

			var helper = document.createElement('textarea');
			helper.value = text;
			helper.setAttribute('readonly', '');
			helper.style.position = 'absolute';
			helper.style.left = '-9999px';
			document.body.appendChild(helper);
			helper.select();
			document.execCommand('copy');
			document.body.removeChild(helper);
			return Promise.resolve();
		};

		buttons.forEach(function(button) {
			button.addEventListener('click', function() {
				var text = button.getAttribute('data-copy-text') || '';
				var label = button.getAttribute('data-copy-label') || 'Value';
				var original = button.textContent;
				button.textContent = 'Copying...';
				writeText(text).then(function() {
					button.textContent = label + ' Copied';
					announce(label + ' copied to clipboard');
					showToast(label + ' copied');
					window.setTimeout(function() {
						button.textContent = original;
					}, 1200);
				}).catch(function() {
					button.textContent = 'Copy failed';
					showToast('Copy failed', true);
					window.setTimeout(function() {
						button.textContent = original;
					}, 1200);
				});
			});
		});
	};

	var contactFormValidation = function() {
		var form = document.getElementById('contact-form');
		if (!form) {
			return;
		}

		var nameInput = document.getElementById('contact-name');
		var emailInput = document.getElementById('contact-email');
		var messageInput = document.getElementById('contact-message');
		var status = document.getElementById('contact-form-status');
		var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		var setError = function(input, message) {
			var errorElement = document.getElementById(input.id + '-error');
			input.setAttribute('aria-invalid', message ? 'true' : 'false');
			if (errorElement) {
				errorElement.textContent = message || '';
			}
		};

		var validate = function() {
			var hasError = false;
			var name = (nameInput.value || '').trim();
			var email = (emailInput.value || '').trim();
			var message = (messageInput.value || '').trim();

			if (name.length < 2) {
				setError(nameInput, 'Please enter your full name.');
				hasError = true;
			} else {
				setError(nameInput, '');
			}

			if (!emailPattern.test(email)) {
				setError(emailInput, 'Please enter a valid email address.');
				hasError = true;
			} else {
				setError(emailInput, '');
			}

			if (message.length < 20) {
				setError(messageInput, 'Message should be at least 20 characters.');
				hasError = true;
			} else {
				setError(messageInput, '');
			}

			return !hasError;
		};

		[nameInput, emailInput, messageInput].forEach(function(input) {
			input.addEventListener('input', function() {
				if (input.getAttribute('aria-invalid') === 'true') {
					validate();
				}
			});
		});

		form.addEventListener('submit', function(event) {
			event.preventDefault();
			if (validate()) {
				status.textContent = 'Message validated. Add an email service or backend endpoint to send it.';
				form.reset();
				[nameInput, emailInput, messageInput].forEach(function(input) {
					setError(input, '');
				});
				return;
			}
			status.textContent = 'Please fix the highlighted fields and try again.';
		});
	};

	var githubMetrics = function() {
		var repoMetric = document.querySelector('[data-metric="repos"]');
		var commitsMetric = document.querySelector('[data-metric="commits"]');
		var languageMetric = document.querySelector('[data-metric="language"]');
		var updatedLabel = document.getElementById('metrics-updated');
		var username = (document.documentElement.getAttribute('data-github-username') || '').trim().replace(/^@/, '');
		var cacheKey = 'bp-github-metrics-v5';
		var metricsSection = document.querySelector('.bp-metrics');
		var retryButton = null;
		var trendNode = document.getElementById('metrics-trend-bars');

		if (!repoMetric || !commitsMetric || !languageMetric || !updatedLabel) {
			return;
		}
		if (!username) {
			updatedLabel.textContent = 'GitHub username is not configured.';
			[repoMetric, commitsMetric, languageMetric].forEach(function(node) {
				node.setAttribute('aria-busy', 'false');
				node.textContent = 'N/A';
			});
			return;
		}
		if (!trendNode) {
			trendNode = document.createElement('div');
			trendNode.id = 'metrics-trend-bars';
			trendNode.style.display = 'grid';
			trendNode.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
			trendNode.style.gap = '8px';
			trendNode.style.marginTop = '10px';
			updatedLabel.insertAdjacentElement('afterend', trendNode);
		}

		[repoMetric, commitsMetric, languageMetric].forEach(function(node) {
			node.setAttribute('aria-busy', 'true');
			node.textContent = '...';
		});
		if (metricsSection) {
			metricsSection.classList.add('metrics-loading');
		}

		var assignMetrics = function(data) {
			var publicRepos = Number(data.repos || 0);
			repoMetric.textContent = String(publicRepos);
			commitsMetric.textContent = String(data.commits);
			var languagesText = data.topLanguages || data.topLanguage || 'N/A';
			languageMetric.textContent = languagesText;
			[repoMetric, commitsMetric, languageMetric].forEach(function(node) {
				node.setAttribute('aria-busy', 'false');
			});
			if (metricsSection) {
				metricsSection.classList.remove('metrics-loading');
			}
			if (retryButton) {
				retryButton.remove();
				retryButton = null;
			}
			var values = [publicRepos, data.commits, languagesText === 'N/A' ? 1 : 2];
			var max = Math.max.apply(Math, values) || 1;
			trendNode.innerHTML = '';
			['Public', 'Commits', 'Lang'].forEach(function(label, index) {
				var bar = document.createElement('div');
				bar.style.background = 'rgba(255,255,255,0.06)';
				bar.style.border = '1px solid rgba(255,255,255,0.12)';
				bar.style.borderRadius = '8px';
				bar.style.padding = '6px';
				bar.innerHTML = '<span style="display:block;font-size:11px;opacity:.8;">' + label + '</span><span style="display:block;height:5px;margin-top:5px;background:rgba(138,210,255,0.9);border-radius:999px;width:' + Math.max(14, Math.round((values[index] / max) * 100)) + '%;"></span>';
				trendNode.appendChild(bar);
			});
		};

		var setUpdatedText = function(dateString, cached) {
			var label = cached ? 'from cache' : 'live';
			var when = new Date(dateString);
			updatedLabel.textContent = 'Last updated: ' + when.toLocaleString() + ' (' + label + ').';
		};

		var readCache = function() {
			try {
				var raw = localStorage.getItem(cacheKey);
				if (!raw) {
					return null;
				}
				return JSON.parse(raw);
			} catch (error) {
				return null;
			}
		};

		var saveCache = function(payload) {
			try {
				localStorage.setItem(cacheKey, JSON.stringify(payload));
			} catch (error) {
				// no-op
			}
		};

		var cached = readCache();
		if (cached && cached.metrics) {
			assignMetrics(cached.metrics);
			setUpdatedText(cached.timestamp, true);
		}

		var loadMetrics = function() {
			var headers = { Accept: 'application/vnd.github+json' };
			var parseNextLink = function(linkHeader) {
				if (!linkHeader) {
					return null;
				}
				var parts = linkHeader.split(',');
				for (var i = 0; i < parts.length; i++) {
					var part = parts[i].trim();
					if (part.indexOf('rel="next"') === -1) {
						continue;
					}
					var match = part.match(/<([^>]+)>/);
					return match ? match[1] : null;
				}
				return null;
			};
			var fetchAllPages = function(initialUrl, maxPages) {
				var results = [];
				var pageCount = 0;
				var loop = function(url) {
					if (!url || pageCount >= maxPages) {
						return Promise.resolve(results);
					}
					pageCount += 1;
					return fetch(url, { headers: headers }).then(function(response) {
						if (!response.ok) {
							throw new Error('GitHub API request failed');
						}
						var nextUrl = parseNextLink(response.headers.get('link'));
						return response.json().then(function(payload) {
							if (Array.isArray(payload)) {
								results = results.concat(payload);
							}
							return loop(nextUrl);
						});
					});
				};
				return loop(initialUrl);
			};
			var userRequest = fetch('https://api.github.com/users/' + username, { headers: headers }).then(function(response) {
				if (!response.ok) {
					throw new Error('GitHub API request failed');
				}
				return response.json();
			});
			var repoRequest = fetchAllPages('https://api.github.com/users/' + username + '/repos?per_page=100&sort=updated', 10);
			var eventsRequest = fetchAllPages('https://api.github.com/users/' + username + '/events/public?per_page=100', 5);

			Promise.all([userRequest, repoRequest, eventsRequest]).then(function(payloads) {
				var user = payloads[0];
				var repos = payloads[1];
				var events = payloads[2];
				var languageTally = {};
				var commits = 0;
				var pushEventCount = 0;
				var cutoff = Date.now() - (1000 * 60 * 60 * 24 * 30);

				repos.forEach(function(repo) {
					if (repo.language) {
						languageTally[repo.language] = (languageTally[repo.language] || 0) + 1;
					}
				});

				events.forEach(function(event) {
					var eventTime = new Date(event.created_at).getTime();
					if (event.type !== 'PushEvent' || eventTime < cutoff) {
						return;
					}
					pushEventCount += 1;
					var commitBatch = event.payload && event.payload.commits ? event.payload.commits.length : 0;
					if (!commitBatch && event.payload && typeof event.payload.size === 'number') {
						commitBatch = event.payload.size;
					}
					if (!commitBatch) {
						commitBatch = 1;
					}
					commits += commitBatch;
				});

				var sortedLanguages = Object.keys(languageTally).sort(function(a, b) {
					return languageTally[b] - languageTally[a];
				});
				var topLanguages = sortedLanguages.slice(0, 3).join(', ') || 'N/A';

				var metrics = {
					repos: Number(user.public_repos || repos.length || 0),
					commits: commits || pushEventCount,
					topLanguages: topLanguages,
					topLanguage: sortedLanguages[0] || 'N/A'
				};
				var payload = { metrics: metrics, timestamp: new Date().toISOString() };

				assignMetrics(metrics);
				setUpdatedText(payload.timestamp, false);
				saveCache(payload);
			}).catch(function() {
				[repoMetric, commitsMetric, languageMetric].forEach(function(node) {
					node.setAttribute('aria-busy', 'false');
				});
				if (!cached) {
					updatedLabel.textContent = 'Unable to load GitHub metrics right now.';
				}
				if (!retryButton) {
					retryButton = document.createElement('button');
					retryButton.type = 'button';
					retryButton.className = 'btn btn-ghost';
					retryButton.textContent = 'Retry metrics';
					retryButton.style.marginTop = '10px';
					retryButton.addEventListener('click', loadMetrics);
					updatedLabel.insertAdjacentElement('afterend', retryButton);
				}
			});
		};

		loadMetrics();
	};

	var keyboardShortcuts = function() {
		var searchInput = document.getElementById('project-search');
		var homeLink = document.querySelector('#bp-navbar a[data-nav-section="home"]');
		var projectLink = document.querySelector('#bp-navbar a[data-nav-section="blog"]');
		var themeButtons = Array.prototype.slice.call(document.querySelectorAll('.js-theme-swatch'));
		var themes = ['slate', 'aurora', 'paper', 'hc'];
		var pendingG = false;
		var pendingTimer = null;
		var openHints = function() {
			document.dispatchEvent(new CustomEvent('app:open-shortcuts'));
		};
		var openPalette = function() {
			document.dispatchEvent(new CustomEvent('app:open-command-palette'));
		};
			var cycleTheme = function() {
				var current = document.documentElement.getAttribute('data-theme') || 'slate';
				var idx = themes.indexOf(current);
				var next = themes[(idx + 1) % themes.length];
				var button = null;
				for (var i = 0; i < themeButtons.length; i++) {
					if (themeButtons[i].getAttribute('data-theme-option') === next) {
						button = themeButtons[i];
						break;
					}
				}
				if (button) {
					button.click();
				}
			};

		document.addEventListener('keydown', function(event) {
			var tag = (event.target && event.target.tagName ? event.target.tagName.toLowerCase() : '');
			var inField = tag === 'input' || tag === 'textarea' || event.target.isContentEditable;
			var key = event.key.toLowerCase();

			if ((event.metaKey || event.ctrlKey) && key === 'k') {
				event.preventDefault();
				openPalette();
				return;
			}

			if (!inField && event.key === '?' ) {
				event.preventDefault();
				openHints();
				return;
			}

			if (!inField && event.key === '/' && searchInput) {
				event.preventDefault();
				searchInput.focus();
				searchInput.select();
				return;
			}

			if (inField) {
				return;
			}

			if (key === 't') {
				cycleTheme();
				return;
			}

			if (key === 'g') {
				pendingG = true;
				if (pendingTimer) {
					window.clearTimeout(pendingTimer);
				}
				pendingTimer = window.setTimeout(function() {
					pendingG = false;
				}, 900);
				return;
			}

			if (pendingG && key === 'h') {
				pendingG = false;
				if (homeLink) {
					homeLink.click();
				}
			}

			if (pendingG && key === 'p') {
				pendingG = false;
				if (projectLink) {
					projectLink.click();
				}
			}
		});
	};

	var progressiveEnhancement = function() {
		document.documentElement.classList.add('js-enabled');
	};

	var runtimeStyleLayer = function() {
		var style = document.createElement('style');
		style.id = 'runtime-elite-styles';
		style.textContent = '' +
			'.project-keyboard-active{outline:2px solid rgba(138,210,255,.85);outline-offset:2px;}' +
			'.metrics-loading .metrics-card{position:relative;overflow:hidden;}' +
			'.metrics-loading .metrics-card::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent,rgba(255,255,255,.09),transparent);animation:metricsShimmer 1.3s linear infinite;}' +
			'.section-current{scroll-margin-top:70px;}' +
			'html[data-density="compact"] .section-shell{padding-block:32px !important;}' +
			'html[data-density="compact"] .card,html[data-density="compact"] .services,html[data-density="compact"] .project-premium .desc{padding:12px !important;}' +
			'.img-skeleton{position:relative;background:rgba(255,255,255,.04);}' +
			'.img-skeleton::after{content:"";position:absolute;inset:0;background:linear-gradient(95deg,transparent,rgba(255,255,255,.10),transparent);animation:metricsShimmer 1.2s linear infinite;}' +
			'@keyframes metricsShimmer{0%{transform:translateX(-100%);}100%{transform:translateX(100%);}}';
		document.head.appendChild(style);
	};

	var preferenceController = function() {
		var density = safeStorage.get('bp-density') || 'comfortable';
		document.documentElement.setAttribute('data-density', density);

		document.addEventListener('app:open-command-palette', function() {
			announce('Command palette opened. Use arrows and enter.');
		});
	};

	var projectMediaSkeleton = function() {
		var media = document.querySelectorAll('.project-premium img, .publication-card img');
		media.forEach(function(img) {
			var holder = img.parentElement;
			if (!holder) {
				return;
			}
			holder.classList.add('img-skeleton');
			var clear = function() {
				holder.classList.remove('img-skeleton');
			};
			if (img.complete) {
				clear();
				return;
			}
			img.addEventListener('load', clear, { once: true });
			img.addEventListener('error', clear, { once: true });
		});
	};

	var heroRoleRotator = function() {
		var subtitle = document.querySelector('.hero-subtitle');
		if (!subtitle) {
			return;
		}
		var roles = [
			'Backend Engineer focused on data-driven systems and production-grade APIs.',
			'Data Engineer building resilient pipelines and analytics tooling.',
			'Full-Stack Builder shipping measurable user-facing experiences.'
		];
		var index = 0;
		var charIndex = 0;
		var deleting = false;
		var paused = false;
		var reduceMotion = appState.reduceMotion;
		var intervalId = null;
		var baseText = roles[0];
		subtitle.textContent = baseText;

		if (reduceMotion) {
			return;
		}

		var tick = function() {
			if (paused) {
				return;
			}
			var text = roles[index];
			if (!deleting) {
				charIndex += 1;
				subtitle.textContent = text.slice(0, charIndex);
				if (charIndex >= text.length) {
					deleting = true;
					window.setTimeout(function() {
						paused = false;
					}, 950);
					paused = true;
				}
			} else {
				charIndex -= 1;
				subtitle.textContent = text.slice(0, Math.max(0, charIndex));
				if (charIndex <= 0) {
					deleting = false;
					index = (index + 1) % roles.length;
				}
			}
		};

		intervalId = window.setInterval(tick, 46);
		window.addEventListener('visibilitychange', function() {
			if (document.hidden && intervalId) {
				window.clearInterval(intervalId);
				intervalId = null;
			}
			if (!document.hidden && !intervalId) {
				intervalId = window.setInterval(tick, 46);
			}
		});
	};

	var commandPalette = function() {
		var overlay = document.createElement('div');
		overlay.id = 'command-palette';
		overlay.setAttribute('aria-hidden', 'true');
		overlay.style.position = 'fixed';
		overlay.style.inset = '0';
		overlay.style.background = 'rgba(7,12,18,0.56)';
		overlay.style.backdropFilter = 'blur(3px)';
		overlay.style.display = 'none';
		overlay.style.zIndex = '2400';

		var panel = document.createElement('div');
		panel.style.width = 'min(92vw, 640px)';
		panel.style.margin = '12vh auto 0';
		panel.style.background = 'rgba(11, 17, 26, 0.95)';
		panel.style.border = '1px solid rgba(255,255,255,0.16)';
		panel.style.borderRadius = '14px';
		panel.style.boxShadow = '0 18px 48px rgba(0,0,0,0.32)';
		panel.style.padding = '12px';

		var input = document.createElement('input');
		input.type = 'search';
		input.placeholder = 'Type command: go home, go projects, theme aurora, density compact...';
		input.style.width = '100%';
		input.style.background = 'rgba(255,255,255,0.06)';
		input.style.border = '1px solid rgba(255,255,255,0.14)';
		input.style.borderRadius = '10px';
		input.style.padding = '10px 12px';
		input.style.color = '#fff';

		var list = document.createElement('div');
		list.style.display = 'grid';
		list.style.gap = '6px';
		list.style.marginTop = '10px';
		list.style.maxHeight = '46vh';
		list.style.overflow = 'auto';

		panel.appendChild(input);
		panel.appendChild(list);
		overlay.appendChild(panel);
		document.body.appendChild(overlay);

		var commands = [
			{ label: 'Go Home', run: function() { var el = document.querySelector('#bp-navbar a[data-nav-section="home"]'); if (el) { el.click(); } } },
			{ label: 'Go Projects', run: function() { var el = document.querySelector('#bp-navbar a[data-nav-section="blog"]'); if (el) { el.click(); } } },
			{ label: 'Go Contact', run: function() { var el = document.querySelector('#bp-navbar a[data-nav-section="contact"]'); if (el) { el.click(); } } },
			{ label: 'Theme Slate', run: function() { var el = document.querySelector('.js-theme-swatch[data-theme-option="slate"]'); if (el) { el.click(); } } },
			{ label: 'Theme Aurora', run: function() { var el = document.querySelector('.js-theme-swatch[data-theme-option="aurora"]'); if (el) { el.click(); } } },
			{ label: 'Theme Paper', run: function() { var el = document.querySelector('.js-theme-swatch[data-theme-option="paper"]'); if (el) { el.click(); } } },
			{ label: 'Theme High Contrast', run: function() { var el = document.querySelector('.js-theme-swatch[data-theme-option="hc"]'); if (el) { el.click(); } } },
			{ label: 'Density Comfortable', run: function() { document.documentElement.setAttribute('data-density', 'comfortable'); safeStorage.set('bp-density', 'comfortable'); } },
			{ label: 'Density Compact', run: function() { document.documentElement.setAttribute('data-density', 'compact'); safeStorage.set('bp-density', 'compact'); } }
		];

		var activeIndex = -1;
		var current = commands.slice();

		var close = function() {
			overlay.style.display = 'none';
			overlay.setAttribute('aria-hidden', 'true');
		};

		var render = function() {
			list.innerHTML = '';
			current.forEach(function(command, index) {
				var button = document.createElement('button');
				button.type = 'button';
				button.textContent = command.label;
				button.style.textAlign = 'left';
				button.style.padding = '8px 10px';
				button.style.borderRadius = '9px';
				button.style.border = '1px solid rgba(255,255,255,0.1)';
				button.style.background = index === activeIndex ? 'rgba(129, 198, 255, 0.24)' : 'rgba(255,255,255,0.02)';
				button.style.color = '#fff';
				button.addEventListener('click', function() {
					command.run();
					close();
				});
				list.appendChild(button);
			});
		};

		input.addEventListener('input', function() {
			var query = (input.value || '').toLowerCase();
			current = commands.filter(function(command) {
				return command.label.toLowerCase().indexOf(query) > -1;
			});
			activeIndex = current.length ? 0 : -1;
			render();
		});

		input.addEventListener('keydown', function(event) {
			if (event.key === 'Escape') {
				close();
				return;
			}
			if (!current.length) {
				return;
			}
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				activeIndex = Math.min(current.length - 1, activeIndex + 1);
				render();
			}
			if (event.key === 'ArrowUp') {
				event.preventDefault();
				activeIndex = Math.max(0, activeIndex - 1);
				render();
			}
			if (event.key === 'Enter' && activeIndex > -1) {
				event.preventDefault();
				current[activeIndex].run();
				close();
			}
		});

		overlay.addEventListener('click', function(event) {
			if (event.target === overlay) {
				close();
			}
		});

		document.addEventListener('app:open-command-palette', function() {
			current = commands.slice();
			activeIndex = 0;
			render();
			overlay.style.display = 'block';
			overlay.setAttribute('aria-hidden', 'false');
			input.value = '';
			input.focus();
		});

		document.addEventListener('keydown', function(event) {
			if (event.key === 'Escape' && overlay.style.display === 'block') {
				close();
			}
		});
	};

	var shortcutsModal = function() {
		var modal = document.createElement('div');
		modal.id = 'shortcut-hints-modal';
		modal.style.position = 'fixed';
		modal.style.inset = '0';
		modal.style.background = 'rgba(5, 9, 14, 0.56)';
		modal.style.display = 'none';
		modal.style.zIndex = '2380';
		modal.innerHTML = '<div style="width:min(92vw,560px);margin:14vh auto 0;background:rgba(12,16,24,0.96);border:1px solid rgba(255,255,255,0.14);border-radius:12px;padding:14px;color:#fff;"><h3 style="margin:0 0 8px 0;">Keyboard Shortcuts</h3><p style="margin:0 0 8px 0;font-size:14px;">/ search projects, g h home, g p projects, t cycle theme, cmd/ctrl+k command palette, ? this help.</p><button type="button" class="btn btn-ghost" id="close-shortcuts-modal">Close</button></div>';
		document.body.appendChild(modal);
		modal.addEventListener('click', function(event) {
			if (event.target === modal) {
				modal.style.display = 'none';
			}
		});
		modal.querySelector('#close-shortcuts-modal').addEventListener('click', function() {
			modal.style.display = 'none';
		});
		document.addEventListener('app:open-shortcuts', function() {
			modal.style.display = 'block';
		});
	};

	var pointerParallaxAndMagnetics = function() {
		if (appState.reduceMotion || appState.coarsePointer) {
			return;
		}
		var hero = document.querySelector('#bp-hero .slider-text-inner');
		var interactive = document.querySelectorAll('.btn, .btn-hire, .project-premium, .services');
		var glow = document.createElement('div');
		glow.style.position = 'fixed';
		glow.style.width = '22px';
		glow.style.height = '22px';
		glow.style.borderRadius = '50%';
		glow.style.pointerEvents = 'none';
		glow.style.zIndex = '2100';
		glow.style.mixBlendMode = 'screen';
		glow.style.background = 'radial-gradient(circle, rgba(120,210,255,0.45), rgba(120,210,255,0))';
		glow.style.transform = 'translate(-50%, -50%)';
		document.body.appendChild(glow);

		document.addEventListener('pointermove', function(event) {
			glow.style.left = event.clientX + 'px';
			glow.style.top = event.clientY + 'px';
			if (hero) {
				var dx = (event.clientX / window.innerWidth - 0.5) * 8;
				var dy = (event.clientY / window.innerHeight - 0.5) * 8;
				hero.style.transform = 'translate3d(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0)';
			}
		}, { passive: true });

		interactive.forEach(function(node) {
			node.addEventListener('pointermove', function(event) {
				var rect = node.getBoundingClientRect();
				var x = event.clientX - (rect.left + rect.width / 2);
				var y = event.clientY - (rect.top + rect.height / 2);
				node.style.transform = 'translate3d(' + (x * 0.04).toFixed(2) + 'px,' + (y * 0.04).toFixed(2) + 'px,0)';
			});
			node.addEventListener('pointerleave', function() {
				node.style.transform = '';
			});
		});
	};

	var smartPrefetch = function() {
		var links = document.querySelectorAll('a[href]');
		var prefetchSet = {};
		var prefetch = function(url) {
			if (!url || prefetchSet[url] || url.indexOf('#') === 0 || url.indexOf('mailto:') === 0 || url.indexOf('tel:') === 0) {
				return;
			}
			prefetchSet[url] = true;
			var link = document.createElement('link');
			link.rel = 'prefetch';
			link.href = url;
			document.head.appendChild(link);
		};
		links.forEach(function(anchor) {
			anchor.addEventListener('mouseenter', function() {
				prefetch(anchor.getAttribute('href'));
			}, { passive: true });
			anchor.addEventListener('focus', function() {
				prefetch(anchor.getAttribute('href'));
			}, { passive: true });
		});
	};

	var runtimeMonitoring = function() {
		var enable = window.location.search.indexOf('devperf=1') > -1 || safeStorage.get('bp-devperf') === '1';
		if (!enable) {
			return;
		}
		var fpsNode = document.createElement('div');
		fpsNode.style.position = 'fixed';
		fpsNode.style.left = '10px';
		fpsNode.style.bottom = '10px';
		fpsNode.style.padding = '6px 8px';
		fpsNode.style.background = 'rgba(8, 12, 18, 0.84)';
		fpsNode.style.color = '#d5ecff';
		fpsNode.style.fontSize = '11px';
		fpsNode.style.border = '1px solid rgba(255,255,255,0.15)';
		fpsNode.style.borderRadius = '8px';
		fpsNode.style.zIndex = '2600';
		document.body.appendChild(fpsNode);

		var frames = 0;
		var last = performance.now();
		var tick = function(now) {
			frames += 1;
			if (now - last >= 1000) {
				fpsNode.textContent = 'FPS: ' + frames;
				frames = 0;
				last = now;
			}
			requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);

		if (window.PerformanceObserver) {
			try {
				var observer = new PerformanceObserver(function(list) {
					list.getEntries().forEach(function(entry) {
						console.log('[perf]', entry.entryType, entry.name || '', Math.round(entry.duration || 0));
					});
				});
				observer.observe({ type: 'longtask', buffered: true });
			} catch (error) {
				// no-op
			}
			try {
				var lcpObserver = new PerformanceObserver(function(list) {
					var entries = list.getEntries();
					var latest = entries[entries.length - 1];
					if (latest) {
						console.log('[perf] lcp', Math.round(latest.startTime));
					}
				});
				lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
			} catch (errorLcp) {
				// no-op
			}
			try {
				var cls = 0;
				var clsObserver = new PerformanceObserver(function(list) {
					list.getEntries().forEach(function(entry) {
						if (!entry.hadRecentInput) {
							cls += entry.value;
						}
					});
					console.log('[perf] cls', cls.toFixed(4));
				});
				clsObserver.observe({ type: 'layout-shift', buffered: true });
			} catch (errorCls) {
				// no-op
			}
		}
	};

	var widgetErrorBoundary = function() {
		window.addEventListener('error', function(event) {
			console.error('[widget-error]', event.message);
		});
		window.addEventListener('unhandledrejection', function(event) {
			console.error('[widget-rejection]', event.reason);
		});
	};





	var sliderMain = function() {
		
	  	$('#bp-hero .flexslider').flexslider({
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

	// Document on load.
	$(function(){
		progressiveEnhancement();
		runtimeStyleLayer();
		preferenceController();
		widgetErrorBoundary();
		themeController();
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
		lightweightReveal();
		motionExperience();
		projectExplorer();
		copyContactValues();
		contactFormValidation();
		githubMetrics();
		keyboardShortcuts();
		commandPalette();
		shortcutsModal();
		heroRoleRotator();
		pointerParallaxAndMagnetics();
		smartPrefetch();
		projectMediaSkeleton();
		if (window.requestIdleCallback) {
			window.requestIdleCallback(runtimeMonitoring);
		} else {
			window.setTimeout(runtimeMonitoring, 600);
		}
	});


}());
