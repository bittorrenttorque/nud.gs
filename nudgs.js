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
		// The DOM events specific to an item.
		events: {
			"click span.nudge-destroy"   : "clear"
		},
		// The NudgeView listens for changes to its model, re-rendering.
		initialize: function() {
			_.bindAll(this, 'clear');
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);
		},
		// Re-render the contents of the nudge item.
		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			if(!this.model.get('properties')) return;
			
			//we generate the falcon urls from information gleen
			var parameters = get_url_parameters(this.model.get('properties').get('streaming_url'));
			var clientid = window.btapp.get('settings').get('remote_client_id');
			var url = 'https://remote.utorrent.com/talon/seed/' + clientid + '/content/' + parameters['sid'] + '/';
			
			//we only want to render if we have a shortened version of the url...if we don't have one get one
			//using the nud.gs shortening service and retry once we have it
			var shortened = jQuery.jStorage.get(url);
			if(!shortened) {
				var mime = 'jpg';
				$.ajax({
					dataType: 'jsonp',
					data: {'url': url, 'mime': mime},
					jsonp: 'jsonp_callback',
					url: 'http://nud.gs/shorten',
					context: this,
					success: function (data) {
						jQuery.jStorage.set(url, data);
						this.render();
					},
				});
				return this;
			}
			
			
			//we want to avoid showing the path of the files...just strip it down to the file name
			var name = this.model.get('properties').get('name').replace(/^.*[\\\/]/, '');
			
			var html = '<div><a target="_blank" title="' + shortened + '" href="' + shortened + '">' + name + '</a>' + tweetShare(url, name) + fbShare(url, name) + '</div>';
			this.$('.nudge-text').html(html);
			return this;
		},
		// Tell the torrent to remove itself...when this change has occured in the torrent
		// client it will bubble back to the backbone library...however this could take a second
		// or two and conflict with the user's expectations...so we'll assume that the torrent remove
		// call will be successful and pre-emptively remove the view
		clear: function() {
			var torrents = window.btapp.get('torrent');
			var torrent = torrents.get(this.model.get('torrent'));
			torrent.bt.remove(function() {});
			this.remove();
		}
	});

	// Btapp Initialization
	// --------------	
	// We're very specific in the filtering for this app, as we're only interested in torrents
	// with the nudge label, and a smattering of other functionality, related to torrent creation
	// and falcon setup/connections
    window.btapp = new Btapp;
	window.btapp.connect({
		/**
		'username': 'patrick',
		'password': 'password',
		**/
		'id': 'btapp',
		'url': 'btapp/',
		'queries': [
			'btapp/torrent/all/*/file/all/*/',
			'btapp/torrent/all/*/remove/',
			'btapp/create/',
			'btapp/browseforfiles/',
			'btapp/settings/',
			'btapp/connect_remote/'
		]
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
	listener.bind(Btapp.QUERIES.FILES, function(file) {
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
		window.btapp.bt.browseforfiles(function () {}, function(files) {
			// It might be nice to notify the user that we're nudging their files (creating torrents)...
			_.each(files, function(value, key) {
				window.btapp.bt.create(function(e) {}, '', [value], function(hash) {
					// and that we're now done...
				}, 'nudges', 'nudges');
			});
		});
	});
	
	// Set Falcon Settings
	// --------------		
	// Listen for the settings to arrive from the torrent client, then make sure
	// that it is connected to falcon to ensure that urls generated will be accessible.
	window.btapp.bind('add:settings', function() {
		if(!window.btapp.get('settings').get('webui.uconnect_username')) {
			var username = generate_random_string();
			var password = generate_random_string();
			window.btapp.bt.connect_remote(function() {}, username, password);
		}
	});
	
	$('#nudges').click(function(e) {
		e.preventDefault();
	});
});
