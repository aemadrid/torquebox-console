$().ready( function() {
  if (ws_host == null) {
    // endpoint should be set in index.haml
    // value provided by torquebox injection
    // but if for whatever reason that doesn't
    // work, we'll try this
    ws_host = 'localhost'
    ws_port = '8675'
    ws_secure = 'false'
  } else { 
    alert( "Using: " + ws_host + ':' + ws_port + '(' + ws_secure + ')' )
  }
  client = new Stomp.Client( ws_host, ws_port, ws_secure )

  var display_message = function( message ) {
      elem = $("#console .content")
      line = message.body
      line = line.replace("<", "&lt;")
      line = line.replace(">", "&gt;")
      if (message.headers['prompt']) {
        $("#console .prompt").html( line )
      } else {
        elem.append( ansispan(line) + "\n" )
        /*elem.append( line + "\n" )*/
      }
      $(window).scrollTop($("body").height())
      $("#console input").focus();
  }

  var send_message = function( message ) {
      var input = $("#console input").attr( "value" ) + "\n"
      $("#console .content").append( $("#console .prompt").text() )
      $("#console .content").append( input )
      $("#console input").attr( "value", "" )
      client.send( "/stomplet/console", {}, input )
      return false;
  }

  var toggle_theme = function() {
    if ($("body").hasClass("light")) {
      $("body").removeClass("light");
      $("body").addClass("dark");
    } else {
      $("body").addClass("light");
      $("body").removeClass("dark");
    }
  }

  $(window).unload( function() { client.disconnect() });

  $( '#input-form' ).bind( "submit", send_message );
  $( '.button' ).bind( "click", toggle_theme );

  client.connect( null, null, function() {
      client.subscribe("/stomplet/console", display_message)
  } );
} )

