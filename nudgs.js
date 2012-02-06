<<<<<<< HEAD
// This is largely inspired by an example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo takes a file on your hard
// drive and gives you a public facing url that can be used to access it.
// You will be able to access it from anywhere, anytime, as long as your computer
// is connected to the internet.

function tweetShare(url, name) {
    var twtLink = 'http://twitter.com/home?status='+encodeURIComponent("Shared with http://nud.gs/! Get " + name + " at " + url);
    return '<a href="'+twtLink+'"><img src=\'tw.png\' class="shareIcon" ><'+'/a>';
}

function fbShare(url, name) {
    return "<a href='http://www.facebook.com/sharer.php?u=" + encodeURIComponent(url) + "&t=" + encodeURIComponent("I just shared " + name + " with http://nud.gs")+ "'> <img src='fb.png' class='shareIcon' > </a>";
}

$(function(){
	// Nudge Model
	// ----------
	window.Nudge = Backbone.Model.extend({ });

	// Nudge Collection
	// ---------------
	window.NudgeList = Backbone.Collection.extend({ model: Nudge });

	// Create our global collection of **Nudges**.
	window.Nudges = new NudgeList;

	// Nudge Item View
	// --------------

	// The DOM element for a nudge item...
	window.NudgeView = Backbone.View.extend({

		//... is a list tag.
		tagName:  "li",

		// Cache the template function for a single item.
		template: _.template($('#item-template').html()),

=======
// This demo takes a file on your hard drive and gives you a public facing url 
// that can be used to access it. You will be able to access it from anywhere, 
// anytime, as long as your computer is connected to the internet 
// (solves the nat problem with the bittorrent "falcon" proxy which torrent 
// clients can be configured to connect to).
$(function(){
	// Nudge Item View
	// --------------
	window.NudgeView = Backbone.View.extend({
		tagName:  "li",
		// Cache the template function for a single item.
		template: _.template($('#item-template').html()),
>>>>>>> master
		// The DOM events specific to an item.
		events: {
			"click span.nudge-destroy"   : "clear"
		},
<<<<<<< HEAD

		// The NudgeView listens for changes to its model, re-rendering.
		initialize: function() {
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);
		},

		// Re-render the contents of the nudge item.
		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			var name = this.model.get('name');
			var url = this.model.get('falcon');
			var html = '<div><a title="' + url + '" href="' + url + '">' + name + '</a>' + tweetShare(url, name) + fbShare(url, name) + '</div>'
			this.$('.nudge-text').html(html);
			return this;
		},

		// Remove the item, destroy the model.
		clear: function() {
			var torrents = window.btapp.get('label').at(0).get('torrent');
			var torrent = torrents.get(this.model.get('hash'));
			debugger;
			torrent.bt.remove(function() {});
			this.model.destroy();
		}

	});

	// The Application
	// ---------------

	// Our overall **AppView** is the top-level piece of UI.
	window.AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: $("#nudgeapp"),

		// Our template for the line of statistics at the bottom of the app.
		statsTemplate: _.template($('#stats-template').html()),

		// At initialization we bind to the relevant events on the `Nudges`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting nudges that might be saved in *localStorage*.
		initialize: function() {
			Nudges.bind('add', this._add, this);
			Nudges.bind('remove', this._remove, this);
		},

		render: function() {
			this.$('#nudge-stats').empty();
			this.$('#nudge-stats').append('<div>Sharing ' + window.Nudges.length + ' files with nud.gs</div>');
		},

		_add: function(nudge) {
			var view = new NudgeView({model: nudge});
			$("#nudge-list").append(view.render().el);
		},
		
		_remove: function(nudge) {
			debugger;
		}
	});

	// Finally, we kick things off by creating the **App**.
	window.App = new AppView;
    window.btapp = new Btapp({
		'id': 'btapp', 
		'url': 'btapp/', 
=======
		// The NudgeView listens for changes to its model, re-rendering.
		initialize: function() {
			_.bindAll(this, 'clear');
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);
		},
		// Re-render the contents of the nudge item.
		render: function() {
			var parameters = get_url_parameters(this.model.get('properties').get('streaming_url'));
			var clientid = window.btapp.get('settings').get('remote_client_id');
			var url = 'https://remote-staging.utorrent.com/talon/seed/' + clientid + '/content/' + parameters['sid'] + '/';
			var name = this.model.get('properties').get('name').replace(/^.*[\\\/]/, '');
			
			$(this.el).html(this.template(this.model.toJSON()));
			var html = '<div><a target="_blank" title="' + url + '" href="' + url + '">' + name + '</a>' + tweetShare(url, name) + fbShare(url, name) + '</div>';
			this.$('.nudge-text').html(html);
			return this;
		},
		// Tell the torrent to remove itself...when this change has occured in the torrent
		// client it will bubble back to the backbone library...however this could take a second
		// or two and conflict with the user's expectations...so we'll assume that the torrent remove
		// call will be successful and pre-emptively remove the view
		clear: function() {
			var torrents = window.btapp.get('label').at(0).get('torrent');
			var torrent = torrents.get('btapp/label/all/nudges/torrent/all/' + this.model.get('torrent') + '/');
			torrent.bt.remove(function() {});
			this.remove();
		}
	});

	// Btapp Initialization
	// --------------	
	// We're very specific in the filtering for this app, as we're only interested in torrents
	// with the nudge label, and a smattering of other functionality, related to torrent creation
	// and falcon setup/connections
    window.btapp = new Btapp({
		/**
		'username': 'patrick',
		'password': 'password',
		**/
		'id': 'btapp',
		'url': 'btapp/',
>>>>>>> master
		'queries': [
			'btapp/label/all/nudges/torrent/all/*/file/all/*/',
			'btapp/label/all/nudges/torrent/all/*/remove/',
			'btapp/create/',
			'btapp/browseforfiles/',
			'btapp/settings/',
			'btapp/connect_remote/'
		]
<<<<<<< HEAD
	}); 
    //window.btapp = new Btapp({'username': 'patrick', 'password': 'password', 'id':'btapp', 'url':'btapp/', 'queries':['btapp/torrent/all/*/file/all/*/properties/all/*/','btapp/create/','btapp/browseforfiles/','btapp/settings/','btapp/connect_remote/']}); 
	$("#new-nudge").click(function(ev) {
	    ev.preventDefault();
		if(!('browseforfiles' in window.btapp.bt)) {
			//alert('whoa there...give me a chance to get situated');
			return;
		}
=======
	});

	// BtappListener Initialization
	// --------------	
	// The Btapp data tree is quite deep, and its a pain to add listeners to each model/collection
	// as they are added from the torrent client...Instead we can use the BtappListener to bind
	// to the creation of certain types of models...in this case all the files in all the torrents
	// that have the "nudges" label. 
	// 
	// This has proven to be the most convenient way to interact with the btapp object,
	// as it greatly simplifies the task of waiting for specific types of models (I assume most
	// apps will be most interested in listening for all files in all torrents the same way 
	// this is done).
	var listener = new BtappListener({'btapp': btapp});
	listener.bind('btapp/label/all/nudges/torrent/all/*/file/all/*/', function(file) {
		var view = new NudgeView({model: file});
		$("#nudge-list").append(view.render().el);	
	});
	
	// Hookup UI for nudge creation (nudging)
	// --------------
	$("#new-nudge").click(function() {
		// Make sure that we're connected to the client...if not we should do some nice
		// messaging to the user explaining why we've failed
		if(!('browseforfiles' in window.btapp.bt)) {
			return;
		}
		// Pop up the torque file browser and when we get back the files the user has
		// selected, create individual torrents for each of them. Hopefully by now we've
		// worked out the falcon situation and the urls are already valid for use.
>>>>>>> master
	    window.btapp.bt.browseforfiles(function () {}, function(files) {
			_.each(files, function(value, key) {
				window.btapp.bt.create(function(e) {}, '', [escape(value)], function(hash) {
					//alert('created a nud');
				}, 'nudges', 'nudges');
			});
	    });
	});
	
<<<<<<< HEAD
	function generate_random_string() {
		var random = 'aslkasjflwhf';
		random += Math.floor(Math.random() * 10000);
		return random;
	}
	
=======
	// Set Falcon Settings
	// --------------		
	// Listen for the settings to arrive from the torrent client, then make sure
	// that it is connected to falcon to ensure that urls generated will be accessible.
>>>>>>> master
	window.btapp.bind('add:settings', function() {
		if(!window.btapp.get('settings').get('webui.uconnect_username')) {
			var username = generate_random_string();
			var password = generate_random_string();
			window.btapp.bt.connect_remote(function() {}, username, password);
		}
	});
<<<<<<< HEAD
	
	function get_url_parameters(url) {
		var vars = [], hash;
		var hashes = url.slice(url.indexOf('?') + 1).split('&');
	 
		for(var i = 0; i < hashes.length; i++)
		{
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
	 
		return vars;
	}
	
	function create_nudge(file) {
		//https://remote-staging.utorrent.com/talon/seed/3335330692/content/3c9d60b3/GOPR0005.MP4	
		var parameters = get_url_parameters(file.get('properties').get('streaming_url'));
		var clientid = window.btapp.get('settings').get('remote_client_id');
		var falcon_url = 'https://remote-staging.utorrent.com/talon/seed/' + clientid + '/content/' + parameters['sid'] + '/';
		var truncated_name = file.get('properties').get('name').replace(/^.*[\\\/]/, '');
		
		var hash = file.get('torrent');
		
		var nudge = new Nudge({ 
			falcon: falcon_url, 
			name: truncated_name,
			hash: hash
		});
		Nudges.add(nudge);
		
		file.bind('destroy', function() { Nudges.remove(nudge); nudge.trigger('destroy'); });
	}
	
	function listen_to_partial_match(view_url, model) {
		model.bind('add', _.bind(listen, this, view_url));
		if(model.length) {
			model.each(function(model) {
				listen(view_url, model);
			});
		} else {
			_.each(model.attributes, function(value) { 
				if(typeof value === 'object' && 'updateState' in value) {
					listen(view_url, value); 
				}
			});
		}
	}

	function matching_url(url_tokens, model_url_tokens) {
		//ignore the last token of each because the strings ended in /
		//and there is an empty token because of it
		for(var i = 0; (i < url_tokens.length - 1) && (i < model_url_tokens.length - 1); i++) {
			if(url_tokens[i] != model_url_tokens[i] && url_tokens[i] != '*') return false;
		}
		return true;
	}
	
	function matching_url_complete(view_url, model_url) {
		var url_tokens = view_url.split('/');
		var model_url_tokens = model_url.split('/');
		return model_url_tokens.length === url_tokens.length && matching_url(url_tokens, model_url_tokens);
	}	
	
	function matching_url_partial(view_url, model_url) {
		var url_tokens = view_url.split('/');
		var model_url_tokens = model_url.split('/');
		return model_url_tokens.length < url_tokens.length && matching_url(url_tokens, model_url_tokens);
	}	
	
	function listen(view_url, model) {
		if(matching_url_partial(view_url, model.url)) {
			listen_to_partial_match(view_url, model);
		} else if(matching_url_complete(view_url, model.url)) {
			create_nudge(model);
		}
	}
	
	//get it all started by listening to our base object
	var view_url = 'btapp/label/all/nudges/torrent/all/*/file/all/*/';
	listen(view_url, btapp);
=======
>>>>>>> master
});
