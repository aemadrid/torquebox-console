$().ready(function () {
  function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
  }

  var ws_host = getURLParameter('host') || tb_ws_host || 'localhost';
  var ws_port = getURLParameter('port') || tb_ws_port || '8675';
  var ws_secure = getURLParameter('secure') || tb_ws_secure || false;

  console.debug('Using: %s:%s (%o)', ws_host, ws_port, ws_secure);

  client = new Stomp.Client(ws_host, ws_port, ws_secure);

  var display_message = function (message) {
    elem = $("#console .content")
    line = message.body
    line = line.replace("<", "&lt;")
    line = line.replace(">", "&gt;")
    if (message.headers['prompt']) {
      $("#console .prompt").html(line)
    } else {
      elem.append(ansispan(line) + "\n")
      /*elem.append( line + "\n" )*/
    }
    $(window).scrollTop($("body").height())
    $("#console input").focus();
  }

  var send_message = function (message) {
    var input = $("#console input").attr("value") + "\n"
    $("#console .content").append($("#console .prompt").text())
    $("#console .content").append(input)
    $("#console input").attr("value", "")
    client.send("/stomplet/console", {}, input)
    return false;
  }

  var toggle_theme = function () {
    if ($("body").hasClass("light")) {
      $("body").removeClass("light");
      $("body").addClass("dark");
    } else {
      $("body").addClass("light");
      $("body").removeClass("dark");
    }
  }

  $(window).unload(function () {
    client.disconnect()
  });

  $('#input-form').bind("submit", send_message);
  $('.button').bind("click", toggle_theme);

  client.connect(function () {
    console.debug('client : Connected ...');
    client.subscribe("/stomplet/console", display_message);
  }, function () {
    console.debug('client : Error connecting ...');
  });
})

