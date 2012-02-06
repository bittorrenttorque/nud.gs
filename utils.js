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

function generate_random_string() {
	var random = 'aslkasjflwhf';
	random += Math.floor(Math.random() * 10000);
	return random;
}

function tweetShare(url, name) {
    return '<a target="_blank" href="http://twitter.com/home?status=' + encodeURIComponent("Shared with http://nud.gs/! Get " + name + " at " + url) + '"><img src=\'img/tw.png\' class="shareIcon" ><'+'/a>';
}

function fbShare(url, name) {
    return '<a target="_blank" href="http://www.facebook.com/sharer.php?u=' + encodeURIComponent(url) + '&t=' + encodeURIComponent("I just shared " + name + " with http://nud.gs") + '"> <img src="img/fb.png" class="shareIcon" > </a>';
}
