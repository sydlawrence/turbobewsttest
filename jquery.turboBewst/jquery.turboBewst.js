/**
 * @preserve Copyright 2011 Syd Lawrence ( www.sydlawrence.com ).
 * Version: 0.5
 *
 * Not sure which licence yet. Need to work it out… jquery plugin will be free, but wordpress plugin will cost
 *
 * Usage: jQuery('#navbar a').turboBewst(options);
 *
 */




(function( jQuery ){
  var $ = jQuery;

	$.fn.turboBewst = function( options ) { 
	 
    if (options) {

			options = $.extend({}, $.fn.turboBewst.defaults, options);
			
			options.selectors = this;
		} else {
		
		  options = $.extend({}, $.fn.turboBewst.defaults);
			
			options.selectors = this;
		}
		
		if (typeof options.transition === "string") {
		  options.transition = eval(options.transition);
		}
		
		
		if (typeof options.reverseTransition === "string") {
		  options.reverseTransition = eval(options.reverseTransition);
		}
		
				
		var settings = options;
    			
		$.fn.turboBewst.hashEvents(settings);
		
	
		// if ie7 or less, return	
		if (!'onhashchange' in window && typeof window.history.pushState == 'function')
			return;
			
			
		// when the selectors are clicked
		$(this).click(function(){
				
			// if same domain
			if (false)
				return true;
			
			// fire the turboBewst navigation method
			$.fn.turboBewst.navigateTo(this,settings);
			
			// avoid default action
			return false;
			
		}).each(function() {
		
			// if same domain
			if (false)
				return;
		
			// if preload
			if  (settings.preload) {
		
				var $t = $(this);
				
				// make sure we have the contents on file			
				$t.turboBewst.storage($t,settings,function(){});
			}	
		});	
		
		var els = $(this);
	

		// listern for popstate
		$(window).bind('popstate',function(data) {
		  
			if (els.filter(':visible').length == 0)
				return;
		
		
			data = data.originalEvent;
			

			
			// nothing to see here, move along	
			if (!data.state || !data.state.href) {
				return;
			}
			
			var options = settings;
		
			if (options.reverseTransition)
				options.transition = options.reverseTransition;
			// find the link
			var i = 0;
			
			
			els.filter('a[href="'+window.location.origin+data.state.href+'"]:visible, a[href="'+data.state.href+'"]:visible, a[href="'+window.location.origin+data.state.href.replace('/','')+'"]:visible, a[href="'+data.state.href.replace('/','')+'"]:visible').each(function() {
				if (i > 0) return;
				// navigate to this link
				if (!$.fn.turboBewst.animating)
					$.fn.turboBewst.navigateTo(this,options,false);
				i++;
			}); 
		});	
		
		
						
		return this;
	
	};

	$.fn.turboBewst.animating = false;
	
	$.fn.turboBewst.hashEventsDone = false;
	$.fn.turboBewst.hashEvents = function(settings) {
		// only do this once
		if ($.fn.turboBewst.hashEventsDone == true)
			return;
		$.fn.turboBewst.hashEventsDone = true;
	
		// check oldschool location.hash
		if (location.hash) {
			
			// strip gumff	
			var str = location.hash.replace('#!/','');
	
			// find the link in the selector
			$('a[href="'+str+'"]').each(function() {
	
				// navigate to this link
				$.fn.turboBewst.navigateTo(this,settings,false);
				
			});
			
			$.fn.turboBewst.loaded = true;
		}
	
		$(window).bind('hashchange', function() {
			
	  		// strip gumff	
			var str = location.hash.replace('#!/','');
			
			// find the link in the selector
			$('a[href="'+str+'"]').each(function() {
	
				// navigate to this link
				$.fn.turboBewst.navigateTo(this,settings,false);
				
			});
			
			$.fn.turboBewst.loaded = true;
		});
	}
	
	
	// replace the current state so we have the stateObj later
	if (typeof window.history.replaceState == "function") {
		window.history.replaceState({href:window.location.pathname+window.location.search,turboBewst:true}, document.title, window.location.pathname+window.location.search);
	}
	// not loaded yet
	$.fn.turboBewst.loaded = false;
	
	
	// when the plugin is first included in an html file
	$.fn.turboBewst.init = function() {
		
		
	}
	
	// send file to history
	$.fn.turboBewst.toHistory = function(url,title) {
	
		// w00p, we can use pushState
		if (typeof window.history.pushState == 'function'){
			window.history.pushState({href:url,turboBewst:true}, title, url);
		}
		
		// gash
		else if ($.fn.turboBewst.options.fallback) {
			location.hash = '!/'+url;
		}	
		
		
		// set the new document title
		document.title = title;
	}
	
	// to add stats on ajax load
	$.fn.turboBewst.callback = function(url,title) {
		
		// this list can be expanded or this function extended
		try {
		
			// used in options
			if (typeof $.fn.turboBewst.options.callback == "function")
				$.fn.turboBewst.options.callback(url,title);
		
			// used for google analytics
			pageTracker._trackPageview(url);
			
			// used for mixpanel
			mpmetrics.track('Visit: '+url);
			
			// add more of the "standard" analytics packages in here
			
		// just in case google anlytics or anything in here throws an error
		} catch(err) {}
	}
	
	// the actual navigation method
	$.fn.turboBewst.navigateTo = function(a,settings,to_history) {
		
		// should we add this to the history?
		if (to_history == undefined)
			to_history = true;
				
		var a = $(a),
			url = a.attr('href'),
			title = a.attr('title');
		
		if (title === "")
		  title = a.html();
		
		// get from storage
		a.turboBewst.storage(a,settings,function(data,settings) {
			
			// we now have the data :)
			$.fn.turboBewst.transition = settings.transition;
			
			$.fn.turboBewst.animating = true;
			
			// fire off the transition
			$.fn.turboBewst.transition(data,settings,function() {});
				
			$.fn.turboBewst.animating = false;	
				
			// shall we add this to the history?
			if (to_history) {
			
				// DO IT!
				$.fn.turboBewst.toHistory(url,title);
				
				// add to the stats as well :)
				$.fn.turboBewst.callback(url,title);
			}
			
		});	
	}
	
	// process the data, remove the gumff
	$.fn.turboBewst.process = function(data) {
	
		// remove '\n'
		var data = data.replace(/\n/g,"");
		
		// remove aything before body, & body itself
		var body = data.replace(/^.*<body[^>]*>/,"");
		
		// remove the final tags
		body = body.replace(/<\/body><\/html>/,"");
		
		// we have nice clean content :)
		return body;
	}
	
	// replace the body content
	$.fn.turboBewst.replaceBody = function(data) {
	
		// standard
		document.getElementsByTagName('body')[0].innerHTML = data;
			
	}
	
	// the actual transition, getting the data onto the page
	$.fn.turboBewst.transitions = function(data,settings,callback) {
		
		var $body = $('body');
		
		// scroll up to the top of the page
		
		// fade it away
		$body.animate(
		
			// yu huh
			{
				opacity:0,			
				scrollTop:0
			},
			
			// how long?
			settings.transitionTime,
			
			// easing
			'',
			
			// callback
			function() {
				
				// replace the body
				$.fn.turboBewst.replaceBody(data);
				
				// fire off event
				$('body').trigger('turboBewst.pageTransition');
				
				// fire the callback
				if (typeof callback == "function")
					callback(data);
				
				// animate it back int
				$body.animate(
					{opacity:1},
					settings.transitionTime,
					'',
					function() {
				
					}
				);
			}
		);
		
	}
	
	// fetch the data
	$.fn.turboBewst.fetch = function(url,title,callback) {

    $.ajaxq('turboBewst',{
      url:url,
      cache:false,
      success:callback
    });
  
	}
	
	// set the data in localStorage
	$.fn.turboBewst.setLocalStorage = function(key,value,expiry) {
			
		// if not supported or not using
		if (!JSON || typeof window.localStorage != "object") {
			// boo!
			return false;
		
		}
	
		// so that we can add expiry, unfortunately this isn't supported by default
		var obj = {
			value: value,
			expires: expiry + new Date().getTime()
		};	
			
		// set the data...
		window.localStorage[key] = JSON.stringify(obj);
			
	};
	
	// get from local storage
	$.fn.turboBewst.getLocalStorage = function(key) {
		
		
		
		// check browser support
		if (typeof localStorage != "object") {
			
			// fail
			return false;
		}		
			
		// retreive the data from the localStorage
		var data = localStorage.getItem(key);
		
		// if nothing found
		if (!data || data == undefined) {
			
			// fail
			return false;
		}
		
		if (!JSON)
			return false;
		
		if (JSON == undefined)
			return false;
		
		
		if (data === "undefined")
		  return false;
		
		
		// data is stored as JSON string
		var object = JSON.parse(data),
	    	now = new Date().getTime().toString();
				
		// check expires
		if (now > object.expires) {
			
			// fail
			return false;
		}
		
		// return data
		return object.value;
		
			// fail
		return false;
	};
	
	// used for storing and retreiving the html content
	$.fn.turboBewst.storage = function(a,settings,callback) {
		var url = a.attr('href'),
			title = a.attr('title');
		
		// check if in var
		if ($.fn.turboBewst.storage.store[url]) {
			
			callback($.fn.turboBewst.storage.store[url],settings);
			return this;
		}
		
		data = false;
		
		// check if in localStorage
		if (settings.localStorage)
			data = $.fn.turboBewst.getLocalStorage(url,settings);
		if (data !== false) {
			
			// save to var
			$.fn.turboBewst.storage.store[url] = data;
			
			callback(data,settings);
			return this;
		}
		
		// if not preload
		if (!settings.preload) {
			
			// show loading
			$.fn.turboBewst.loading.start();
		}
		
		// not yet fetched
		$.fn.turboBewst.fetch(url, title, function(data) {
		
			// save to var
			$.fn.turboBewst.storage.store[url] = $.fn.turboBewst.process(data);	
						
			// save in storage
			if(settings.localStorage)
				$.fn.turboBewst.setLocalStorage(url,$.fn.turboBewst.process(data),settings.localStorage);
			
			
			// if not preload
			if (!settings.preload) {
				
				// finished loading
				$.fn.turboBewst.loading.finished();
			}
			
			
			callback($.fn.turboBewst.process(data),settings);
			return this;
		});
		
		return this;
	}
	
	// the variable store
	$.fn.turboBewst.storage.store = {};
	
	// when ready ;)
	$.fn.turboBewst.ready = function(callback) {
		
		// standard doc ready
		$(document).ready(function() {
		
			// bind for the new body
			$('body').bind('turboBewst.pageTransition',callback);
			
			callback();
		});
	}
	

	
	
	// the loading animation
	$.fn.turboBewst.loading = {
		div: $('<div class="turboBewst_loading"/>'),
		overlay: $('<div class="turboBewst_overlay"/>')
	};
	
	// executed when not on preload, and first fetch
	$.fn.turboBewst.loading.start = function() {
		
		// ghetto
		var div = $.fn.turboBewst.loading.div,
			overlay = $.fn.turboBewst.loading.overlay;
			
		// add them to body	
		$('body').append( div )
				 .append( overlay );
		
		// fade in
		div.css('opacity',0).animate({opacity:1},500);
		overlay.css('opacity',0).animate({opacity:1},500);
	}
	
	// executed when not on preload, and first fetch complete
	$.fn.turboBewst.loading.finished = function() {
		// fade out
		$.fn.turboBewst.loading.div.css('opacity',1).animate({opacity:0},500,'',function() {$.fn.turboBewst.loading.div.remove()});
		$.fn.turboBewst.loading.overlay.css('opacity',1).animate({opacity:0},500,'',function() {$.fn.turboBewst.loading.overlay.remove()});
	} 
	
	// TRANSITIONS

	// slideLeft transition
	$.fn.turboBewst.transitions.slideLeft = function(data,settings,callback) {
		
		var $body = $('body'),
			$o = $('<div class="turboBewst_page" />'),
			$n = $('<div class="turboBewst_page" />');
		
		var $cont = $('<div class="turboBewst_container" />');
		$o.width($body.width()).height($body.height());
		$n.width($body.width()).height($body.height());
		
		$cont.width($body.width() * 2).height($body.height());
		
		$body.css('overflow-y','scroll');
			
		time = $body.scrollTop();
		
		$body.animate(
		
			// yu huh
			{
				scrollTop:0
			},
			time,
			'',
			function() {
			
				$o.append($body.children());
			
				$n.append(data);
				
				$cont.append($o).append($n);
				
				$body.append($cont);
				
				// fire off event
				$('body').trigger('turboBewst.pageTransition');
				
				// fire the callback
				if (typeof callback == "function")
					callback(data);
				
				if ($n.height() < $(window).height())	{
					$n.height($(window).height());	
				}
				
				
				var left = $body.width();
				$cont.css('left',0).animate({
					left: 0 - left
				},settings.transitionTime,'',function(){
					$body.append($n.children());
					$cont.hide();
				})
			
			}
		);
	}
	
	
	
	$.fn.turboBewst.transitions.slideRight = function(data,settings,callback) {
		
		var $body = $('body'),
			$o = $('<div class="turboBewst_page" />'),
			$n = $('<div class="turboBewst_page" />');
		
		var $cont = $('<div class="turboBewst_container" />');
		$o.width($body.width());
		$n.width($body.width());
		
		$cont.width($body.width() * 2).height($body.height());
		
		$body.css('overflow-y','scroll');
			
		time = $body.scrollTop();
		
		$body.animate(
		
			// yu huh
			{
				scrollTop:0
			},
			time,
			'',
			function() {
			
				$o.append($body.children());
			
				$n.append(data);
				
				$cont.append($n).append($o);
				
				$body.append($cont);
				
				// fire off event
				$('body').trigger('turboBewst.pageTransition');
				
				// fire the callback
				if (typeof callback == "function")
					callback(data);
				
				
				if ($n.height() < $(window).height())	{
					$n.height($(window).height());	
				}
				
				
				
				var left = $body.width();
				$cont.css('left',(0 - left)+"px").animate({
					left: 0
				},settings.transitionTime,'',function(){
					$body.append($n.children());
					$cont.hide();
				})
			
			}
		);
	}
	
	
	
	// slideLeft transition
	$.fn.turboBewst.transitions.slideUp = function(data,settings,callback) {
		
		var $body = $('body'),
			$o = $('<div class="turboBewst_page" />'),
			$n = $('<div class="turboBewst_page" />');
		
		var $cont = $('<div class="turboBewst_container" />');
		$o.width($body.width()).height($body.height());
		$n.width($body.width()).height($body.height());
		
		$cont.width($body.width()).height($body.height()*2);
		
		$body.css('overflow-y','scroll');
			
		time = $body.scrollTop();
		
		$body.animate(
		
			// yu huh
			{
				scrollTop:0
			},
			parseInt(time/2),
			'',
			function() {
			
				$o.append($body.children());
				$n.append(data);			
				$cont.append($o).append($n);
				$body.append($cont);
				
				if ($n.height() < $(window).height())	{
					$n.height($(window).height());	
				}
				
				
				// fire off event
				$('body').trigger('turboBewst.pageTransition');
				
				// fire the callback
				if (typeof callback == "function")
					callback(data);
				
				$cont.css('margin-top',0).animate({
						marginTop: (0 - $o.height()) + "px",
						scrollTop:0
					},
					settings.transitionTime,
					'',
					function(){
						$body.append($n.children());
						$cont.hide();
					}
				);
			}
		);
	}
	
	// slideLeft transition
	$.fn.turboBewst.transitions.slideDown = function(data,settings,callback) {
		
		var $body = $('body'),
			$o = $('<div class="turboBewst_page" />'),
			$n = $('<div class="turboBewst_page" />');
		
		var $cont = $('<div class="turboBewst_container" />');
		$o.width($body.width())
//			.height($body.height());
		$n.width($body.width())
//			.height($body.height());
		
		$cont.width($body.width())
//			.height($body.height()*2);
		
		$body.css('overflow-y','scroll');
			
		time = $body.scrollTop();
		
		$body.animate(
		
			// yu huh
			{
				scrollTop:0
			},
			parseInt(time/2),
			'',
			function() {
			
				$o.append($body.children());
				$n.append(data);
				
				$cont.append($n).append($o);
				$body.append($cont);
				// fire off event
				$('body').trigger('turboBewst.pageTransition');
				
				// fire the callback
				if (typeof callback == "function")
					callback(data);
					
				if ($n.height() < $(window).height())	{
					$n.height($(window).height());	
				}	
				
				$cont.css('margin-top',(0 - $n.height())+'px')
					.animate({
						marginTop: 0 + "px",
						scrollTop:0
					},
					settings.transitionTime,
					'',
					function(){
						$body.append($n.children());
						$cont.hide();
					}
				);
			}
		);
	}
	
	
	
	// fade transition
	$.fn.turboBewst.transitions.fade = function(data,settings,callback) {
		
		var $body = $('body');
		
		// scroll up to the top of the page
		
		// fade it away
		$body.animate(
		
			// yu huh
			{
				opacity:0,			
				scrollTop:0
			},
			
			// how long?
			settings.transitionTime,
			
			// easing
			'',
			
			// callback
			function() {
			
	
			
				// replace the body
				$.fn.turboBewst.replaceBody(data);
				
				// fire off event
				$('body').trigger('turboBewst.pageTransition');
				
				// fire the callback
				if (typeof callback == "function")
					callback(data);
				
				// animate it back int
				$body.animate(
					{opacity:1},
					settings.transitionTime,
					'',
					function() {
				
					}
				);
			}
		);
		
	}
	
	$.fn.turboBewst.defaults = {
		selector: 			'nav a',
		preload: 			true,
		fallback:	 		true,
	 	transitionTime:		500,
	 	transition: 		$.fn.turboBewst.transitions.fade,
	 	reverseTransition: 	$.fn.turboBewst.transitions.fade,
	 	localStorage: 		300000,
	 	callback: 			function() {}
	};
		 	
		 	

})( jQuery );

// reset the storage basically
jQuery.fn.turboBewst.reset = function() {
  if (typeof window.localStorage != "object")
    return;
  window.localStorage.clear();
}












/*
 * jQuery AjaxQ - AJAX request queueing for jQuery
 *
 * Version: 0.0.1
 * Date: July 22, 2008
 *
 * Copyright (c) 2008 Oleg Podolsky (oleg.podolsky@gmail.com)
 * Licensed under the MIT (MIT-LICENSE.txt) license.
 *
 * http://plugins.jquery.com/project/ajaxq
 * http://code.google.com/p/jquery-ajaxq/
 */

jQuery.ajaxq = function (queue, options)
{
	// Initialize storage for request queues if it's not initialized yet
	if (typeof document.ajaxq == "undefined") document.ajaxq = {q:{}, r:null};

	// Initialize current queue if it's not initialized yet
	if (typeof document.ajaxq.q[queue] == "undefined") document.ajaxq.q[queue] = [];
	
	if (typeof options != "undefined") // Request settings are given, enqueue the new request
	{
		// Copy the original options, because options.complete is going to be overridden

		var optionsCopy = {};
		for (var o in options) optionsCopy[o] = options[o];
		options = optionsCopy;
		
		// Override the original callback

		var originalCompleteCallback = options.complete;

		options.complete = function (request, status)
		{
			// Dequeue the current request
			document.ajaxq.q[queue].shift ();
			document.ajaxq.r = null;
			
			// Run the original callback
			if (originalCompleteCallback) originalCompleteCallback (request, status);

			// Run the next request from the queue
			if (document.ajaxq.q[queue].length > 0) document.ajaxq.r = jQuery.ajax (document.ajaxq.q[queue][0]);
		};

		// Enqueue the request
		document.ajaxq.q[queue].push (options);

		// Also, if no request is currently running, start it
		if (document.ajaxq.q[queue].length == 1) document.ajaxq.r = jQuery.ajax (options);
	}
	else // No request settings are given, stop current request and clear the queue
	{
		if (document.ajaxq.r)
		{
			document.ajaxq.r.abort ();
			document.ajaxq.r = null;
		}

		document.ajaxq.q[queue] = [];
	}
}