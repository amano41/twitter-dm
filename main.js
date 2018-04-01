// https://gist.github.com/kijtra/f4cdd8775277372d42f7
// https://gist.github.com/M-Igashi/750ab08718687d11bff6322b8d6f5d90


// 認証
function authorize() {
  twitter.oauth.authorize();
}


// 認証成功後のコールバック関数
function callback(request) {
  return twitter.oauth.callback(request);
}


// 認証キャッシュ削除
function clear() {
  twitter.oauth.clear();
}


function doPost(e) {
  
  var jsonString = e.postData.getDataAsString();
  var data = JSON.parse(jsonString)
  
  var properties = PropertiesService.getScriptProperties().getProperties();
  var token = properties.VERIFICATION_TOKEN;

  if (data.token != token) {
    throw new Error("Invalid token: " + data.token);
  }
  
  var userid = properties.USER_ID;
  var message = data.text
  return twitter.sendDirectMessage(userid, message);
}


var twitter = {
  
  
  oauth: {
    
    name: "twitter",
    
    getService: function() {

      var properties = PropertiesService.getScriptProperties().getProperties();
      var consumerKey = properties.CONSUMER_KEY;
      var consumerSecret = properties.CONSUMER_SECRET;

      return OAuth1.createService(this.name)
        .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
        .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
        .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
        .setConsumerKey(consumerKey)
        .setConsumerSecret(consumerSecret)
        .setCallbackFunction('callback')
        .setPropertyStore(PropertiesService.getUserProperties());
    },
    
    authorize: function() {
      var service = this.getService();
      if (service.hasAccess()) {
        Logger.log("認証済み");
      }
      else {
        Logger.log(service.authorize());
      }
    },
    
    callback: function(request) {
      var service = this.getService();
      var isAuthorized = service.handleCallback(request);
      if (isAuthorized) {
        return HtmlService.createHtmlOutput("認証成功");
      } else {
        return HtmlService.createHtmlOutput("認証失敗");
      }
   },
    
    clear: function() {
      var service = this.getService();
      service.reset();
    }
  },
  
  
  postTweet: function(text) {
    
    var url = "https://api.twitter.com/1.1/statuses/update.json";
    
    var options = {
      "method": "POST",
      "payload": {
        "status": text
      }
    };
    
    Logger.log(text);
    
    var service = this.oauth.getService();
    var response = service.fetch(url, options);
    Logger.log(response.getContentText())
    
    return response;
  },
  
  
  sendDirectMessage: function(userid, message) {
    
    var url = "https://api.twitter.com/1.1/direct_messages/events/new.json";

    var payload = {
      "event": {
        "type": "message_create",
        "message_create": {
          "target": {
            "recipient_id": userid
          },
          "message_data": {
            "text": message
          }
        }
      }
    };
    
    var options = {
      "method": "POST",
      "contentType": "application/json",
      "payload": JSON.stringify(payload)
    };
    
    Logger.log(userid);
    Logger.log(message);
    
    var service = this.oauth.getService();
    var response = service.fetch(url, options);
    Logger.log(response.getContentText());
    
    return response;
  }

};
