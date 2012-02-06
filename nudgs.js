// This is largely inspired by an example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo takes a file on your hard
// drive and gives you a public facing url that can be used to access it.
// You will be able to access it from anywhere, anytime, as long as your computer
// is connected to the internet.
$(function(){
	// Create our global collection of **Nudges**.
	window.Nudges = new Backbone.Collection;

	// Nudge Item View
	// --------------
	window.NudgeView = Backbone.View.extend({
		tagName:  "li",
		// Cache the template function for a single item.
		template: _.template($('#item-template').html()),
		// The DOM events specific to an item.
		events: {
			"click span.nudge-destroy"   : "clear"
		},
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
			var html = '<div><a target="_blank" title="' + url + '" href="' + url + '">' + name + '</a>' + tweetShare(url, name) + fbShare(url, name) + '</div>'
			this.$('.nudge-text').html(html);
			return this;
		},
		// Remove the item, destroy the model.
		clear: function() {
			var torrents = window.btapp.get('label').at(0).get('torrent');
			var torrent = torrents.get(this.model.get('hash'));
			torrent.bt.remove(function() {});
			this.model.destroy();
		}
	});

	// The Application
	// ---------------
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
		/**
		'username': 'patrick',
		'password': 'password',
		**/
		'id': 'btapp', 
		'url': 'btapp/', 
		'queries': [
			'btapp/label/all/nudges/torrent/all/*/file/all/*/',
			'btapp/label/all/nudges/torrent/all/*/remove/',
			'btapp/create/',
			'btapp/browseforfiles/',
			'btapp/settings/',
			'btapp/connect_remote/'
		]
	}); 
	$("#new-nudge").click(function(ev) {
	    ev.preventDefault();
		if(!('browseforfiles' in window.btapp.bt)) {
			//alert('whoa there...give me a chance to get situated');
			return;
		}
	    window.btapp.bt.browseforfiles(function () {}, function(files) {
			_.each(files, function(value, key) {
				window.btapp.bt.create(function(e) {}, '', [escape(value)], function(hash) {
					//alert('created a nud');
				}, 'nudges', 'nudges');
			});
	    });
	});
	
	window.btapp.bind('add:settings', function() {
		if(!window.btapp.get('settings').get('webui.uconnect_username')) {
			var username = generate_random_string();
			var password = generate_random_string();
			window.btapp.bt.connect_remote(function() {}, username, password);
		}
	});
	
	function create_nudge(file) {
		//https://remote-staging.utorrent.com/talon/seed/3335330692/content/3c9d60b3/GOPR0005.MP4	
		var parameters = get_url_parameters(file.get('properties').get('streaming_url'));
		var clientid = window.btapp.get('settings').get('remote_client_id');
		var falcon_url = 'https://remote-staging.utorrent.com/talon/seed/' + clientid + '/content/' + parameters['sid'] + '/';
		var truncated_name = file.get('properties').get('name').replace(/^.*[\\\/]/, '');
		
		var hash = file.get('torrent');
		
		var nudge = new Backbone.Model({ 
			falcon: falcon_url, 
			name: truncated_name,
			hash: hash
		});
		Nudges.add(nudge);
		
		file.bind('destroy', function() { Nudges.remove(nudge); nudge.trigger('destroy'); });
	}
	
	//get it all started by listening to our base object
	var listener = new BtappListener({'btapp': btapp});
	listener.bind('btapp/label/all/nudges/torrent/all/*/file/all/*/', create_nudge);
});
