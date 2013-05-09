require File.expand_path(File.dirname(__FILE__) + '/lib/web/console')
require 'torquebox-stomp'

use TorqueBox::Stomp::StompJavascriptClientProvider
run Sinatra::Application
