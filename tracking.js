(function() {
	var Slider = function() {
		this.init();
	}

	$.extend(Slider.prototype, {
		init: init,
		initSliderSize: initSliderSize,
		autoPlay: autoPlay,
		slideItem: slideItem,
		mouseHover: mouseHover,
		clickSlide: clickSlide,
		showPhone: showPhone,
		setPhonePos: setPhonePos,
		getClipRect: getClipRect,
		cloneTrackingObj: cloneTrackingObj
	});

	function init() {
		this.slider = $('.slide-items');
		this.slideBtns = $('.slide-btns li');
		this.slideBox = $('.slide-box');
		this.slideItems = this.slider.find('li');
		this.phone = $('.phone');

		this.initSliderSize();
		$(window).resize(this.initSliderSize());

		this.autoPlay();
		this.showPhone();
		this.mouseHover();
		this.clickSlide();
	}

	function initSliderSize() {
		this.slideWidth = this.slideBox.width();
		this.slideItems.width(this.slideWidth);
		this.slider.width(this.slideItems.length * this.slideWidth);
	}

	function autoPlay() {
		var self = this;
		self.timer = setInterval(function() {
			var curItem = self.slider.find('.active'),
				nextItem = curItem.next();
			if (!nextItem.length) {
				nextItem = self.slideItems.eq(0);
			}
			curItem.removeClass('active');
			self.slideItem(nextItem);
		}, 3000);
	}

	function mouseHover() {
		var self = this;
		self.slideBox.mouseenter(function(e) {
			if (self.timer) {
				clearInterval(self.timer);
				self.timer = null;
			}
		}).mouseleave(function() {
			if (!self.timer) {
				self.autoPlay();
			}
			self.phone.hide();
		});
	}

	function clickSlide() {
		var self = this;
		self.slideBtns.click(function() {
			self.slideItems.removeClass('active');
			self.slideItem(self.slideItems.eq($(this).index()));
		});
	}

	function slideItem(nextItem) {
		var self = this,
			index = nextItem.index();

		self.slider.animate({
			left: '-' + index * self.slideWidth
		}, 500);
		nextItem.addClass('active');
		self.slideBtns.removeClass('btn-active').eq(index).addClass('btn-active');
		self.phone.hide();
	}

	function showPhone() {
		var self = this;
		self.isTracking = false;

		self.slideBox.mousemove(function(e) {
			var $this = $(this),
				$activeItem = $this.find('.active');

			if (!$activeItem.hasClass('tracking')) {
				$this.css({
					cursor: 'default'
				});
				return;
			}

			self.phone.show();
			$this.css({
				cursor: 'none'
			});
			self.setPhonePos(e);

			var $trackingImg = $activeItem.find('.tracking-img'),
				trackingImgPos = $trackingImg.position(),
				trackingEdgeW = $trackingImg.width() / 3 * 2,
				trackingEdgeH = $trackingImg.height() / 3 * 2,

				phonePos = self.phone.position(),
				$model = $activeItem.find('.model'),
				halfModelWidth = $model.width() / 2,
				halfModelHeight = $model.height() / 2;

			if (phonePos.left >= trackingImgPos.left &&
				phonePos.left <= (trackingImgPos.left + trackingEdgeW) &&
				phonePos.top >= (trackingImgPos.top - 200) &&
				phonePos.top <= (trackingImgPos.top + trackingEdgeH)) {

				if (!self.isTracking) {
					self.cloneTrackingObj($trackingImg);
					self.cloneTrackingObj($model);
				}
				self.isTracking = true;

				var phoneRatio = self.phone[0].naturalHeight / self.phone.height();

				var phonePadding = {
						left: 32 / phoneRatio,
						right: 32 / phoneRatio,
						top: 142 / phoneRatio,
						bottom: 120 / phoneRatio
					},
					modelPos = {
						left: trackingImgPos.left + ($trackingImg.width() - $model.width()) / 2,
						top: trackingImgPos.top + ($trackingImg.height() - $model.height()) / 2,
						right: trackingImgPos.left + ($trackingImg.width() - $model.width()) / 2 + $model.width(),
						bottom: trackingImgPos.top + ($trackingImg.height() - $model.height()) / 2 + $model.height()
					};

				phonePos = {
					left: phonePos.left + phonePadding.left,
					right: phonePos.left + self.phone.width() - phonePadding.right,
					top: phonePos.top + phonePadding.top,
					bottom: phonePos.top + self.phone.height() - phonePadding.bottom
				};

				var clipRect = self.getClipRect(phonePos, modelPos);

				$('.model.isClone').css({
					left: modelPos.left,
					top: modelPos.top,
					clip: 'rect(' + clipRect.top + 'px,' + clipRect.right + 'px,' + clipRect.bottom + 'px,' + clipRect.left + 'px)'
				});

				$activeItem.addClass('blur');
			} else {
				if (self.isTracking) {
					$('.model.isClone').hide();
					self.slideBox.find('.isClone').remove();
				}
				$activeItem.removeClass('blur');
				self.isTracking = false;
			}
		});
	}

	function setPhonePos(e) {
		var self = this,
			slideHeight = self.slideBox.height(),
			phoneWidth = self.phone.width(),
			phoneHeight = self.phone.height(),
			halfPhoneWidth = phoneWidth / 2,
			halfPhoneHeight = phoneHeight / 2;

		if (e.pageX <= halfPhoneWidth && e.pageY <= halfPhoneHeight) {
			self.phone.css({
				left: 0,
				top: 0
			});
		} else if (e.pageX >= self.slideWidth - halfPhoneWidth && e.pageY <= halfPhoneHeight) {
			self.phone.css({
				left: self.slideWidth - phoneWidth,
				top: 0
			});
		} else if (e.pageX <= halfPhoneWidth && e.pageY >= slideHeight - halfPhoneHeight) {
			self.phone.css({
				left: 0,
				top: slideHeight - phoneHeight
			});
		} else if (e.pageX >= self.slideWidth - halfPhoneWidth && e.pageY >= slideHeight - halfPhoneHeight) {
			self.phone.css({
				left: self.slideWidth - phoneWidth,
				top: slideHeight - phoneHeight
			});
		} else if (e.pageX <= halfPhoneWidth) {
			self.phone.css({
				left: 0,
				top: e.pageY - halfPhoneHeight
			});
		} else if (e.pageX >= self.slideWidth - halfPhoneWidth) {
			self.phone.css({
				left: self.slideWidth - phoneWidth,
				top: e.pageY - halfPhoneHeight
			});
		} else if (e.pageY <= halfPhoneHeight) {
			self.phone.css({
				left: e.pageX - halfPhoneWidth,
				top: 0
			});
		} else if (e.pageY >= slideHeight - halfPhoneHeight) {
			self.phone.css({
				left: e.pageX - halfPhoneWidth,
				top: slideHeight - phoneHeight
			});
		} else {
			self.phone.css({
				left: e.pageX - halfPhoneWidth,
				top: e.pageY - halfPhoneHeight
			});
		}
	}

	function getClipRect(phonePos, modelPos) {
		return {
			top: phonePos.top - modelPos.top,
			right: phonePos.right - modelPos.left,
			bottom: phonePos.bottom - modelPos.top,
			left: phonePos.left - modelPos.left
		}
	}

	function cloneTrackingObj($obj) {
		var tempObj = $obj.clone();
		tempObj.css({
			width: $obj.width(),
			height: $obj.height()
		}).addClass('isClone');

		this.slideBox.append(tempObj);
	}

	new Slider();
}());