/*jslint white:true,sloppy:true */
/*global window:true,freedom:true,setTimeout,console,VCardStore,global */

/**
 * Implementation of a Social provider for freedom.js that
 * uses sockets to make xmpp connections to chat networks.
 **/

// Global declarations for node.js
if (typeof global !== 'undefined') {
  if (typeof window === 'undefined') {
    global.window = {};
  }
} else {
  if (typeof window === 'undefined') {
    var window = {};
  }
}



var XMPPSocialProvider = function(dispatchEvent) {
  console.log("connecting to firebase");

  Firebase.INTERNAL.forceWebSockets();


  // TODO: multiple instance (client support)
  // var g_instance = prompt('Instance name', 'Laptop');

  var baseUrl = "https://popping-heat-4874.firebaseio.com";
  var g_authData;

  function login() {
    return new Promise(function(F, R) {
      console.log('creating baseRef');
      var baseRef = new Firebase(baseUrl);
      console.log('baseRef created');
      baseRef.authWithOAuthToken("facebook", 'CAACTRbmvZCKUBAP66Sf5s6BZC6JThs2vTcYfvvktAbZCfvZBZAFXOIatqLpEXiOsda78QQ2rJAWuQWKoXRyVVx4VcezuAwnyFEDydmhU44u3nyCnHpKzg6Y9yELN5bAYWflrZCzFFrvUa6k6zErIZAQcEMit7xZAF1EAYeZCdO75iihuQXjmjNK6NDWET5YX7dKcaW4JD9a9xZAQZDZD',
       function(error, authData) {
        if (error) {
          R("Login Failed! " + error);
        } else {
          console.log("Authenticated successfully with payload:", authData, authData.facebook);
          g_authData = authData;
          // $('#myName').text(authData.facebook.displayName);
          F();
        }
      });
    });
  }

  function loadFriends() {
    console.log('entering loadFriends');
    return facebookGet('me/friends')
        .then(function(friendsData) {
          console.log('got friends', friendsData);
          var friendsRef = new Firebase(baseUrl + '/users/' + g_authData.uid + '/friends');
          for (var i = 0; i < friendsData.data.length; ++i) {
            var friend = friendsData.data[i];
            console.log('pushing friend', friend);
            // TODO: this is going to clobber messages each time the friend signs in..  Do we want that?
            friendsRef.child('facebook:' + friend.id).set(friend.name);
          }
        });
  }

  function facebookGet(resourceStr) {
    return new Promise(function(F,R) {
      if (!g_authData) {
        R('Not signed in');
      }
      // Create url from resourceStr and accessToken.
      var hasArgs = resourceStr.indexOf('?') >= 0;
      var url = ('https://graph.facebook.com/v2.1/' + resourceStr) +
          (hasArgs ? '&' : '?') +
          'access_token=' + g_authData.facebook.accessToken;
      $.getJSON(url, F);
    });
  }

  function sendMessage(dest, message) {
    var friendId = 'facebook:' + dest;
    var friendMessagesRef = new Firebase(
        baseUrl + '/users/' + friendId + '/friends/' + g_authData.uid +
        '/messages');
    friendMessagesRef.push(message);
  }

  login()
      .then(loadFriends)
      .catch(function(e) { console.error(e); });
};

// Register provider when in a module context.
if (typeof freedom !== 'undefined') {
  freedom.social().provideAsynchronous(XMPPSocialProvider);
}
