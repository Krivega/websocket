//The MIT License (MIT)
// v 1.0
//Copyright (c) 2013 Krivega Dmitriy http://krivega.com

function WebSocketConstructor(url) {
  var self = this;
  self.calbackObj = {};
  self.calbackNotifObj = {};
  self.id = 0;
  //соединение с сокетом
  self.socket = new WebSocket(url);
  //обработка ошибок сокета
  self.socket.onerror = function (error) {
    console.log("Ошибка WebSocket " + error.message);
  };

  //обработка закрытия сокета
  self.socket.onclose = function (e) {
    if (e.wasClean) {
      console.log('Соединение закрыто чисто');
    } else {
      console.log('Обрыв соединения, страница будет перезагружена через 5 секунд');
    }
    setTimeout(function(){location.reload(false);}, 5000);
  };

  self.socket.onmessage = function (e) {
    var data = JSON.parse(e.data);
    if(data.error){
      console.log('WebSocket onmessage ERROR. --- Код: ' + data.error.code + ' сообщение: ' + data.error.message);    
    }
    if(data.id && !data.method){
      if(self.calbackObj[data.id]){        
        self.calbackObj[data.id](data);
        delete self.calbackObj[data.id];
      } 
    }else if(self.calbackNotifObj[data.method]){
      self.calbackNotifObj[data.method](data);
    }    
  };
  
  self.open = function (callback) {
    self.socket.onopen = function() {
      callback();
    };
  };
  
  self.subscribeNotif = function (method, calback) {
    self.calbackNotifObj[method]=function(data){
      calback(data);
    };
  };
  
  self.on = function (method, params, calback) {
    var self = this;
    var id = self.guid();
    self.calbackObj[id]=function(data){
      calback(data);
    };
    dataSend = JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: id
    });
    self.socket.send(dataSend);
  };

  self.send = function (method, params, id) {
    var self = this;
    if(!id){
      id = self.guid();      
    }
    
    if (id==='noid') {
      var dataSend = JSON.stringify({
        jsonrpc: '2.0',
        method: method,
        params: params
      });
    } else {
      dataSend = JSON.stringify({
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: id
      });
    }
    self.socket.send(dataSend);
  };

  //метод форимрования нового айдишника
  self.guid = function () {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    function guid() {
      return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
    }
    self.id = guid();
    return self.id;
  };
}

var ws = new WebSocketConstructor('ws://' + document.location.host + '/api/');
