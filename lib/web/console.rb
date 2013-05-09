require 'torquebox'
require 'torquebox-stomp'
require 'sinatra'
require 'haml'

class Sinatra::Application
  include TorqueBox::Injectors
end

helpers do
  def endpoint
    unless @endpoint
      endpoint_info = fetch('stomp-endpoint')
      if endpoint_info =~ /host: (.*), port=(.*), secure=(.*)/i
        host   = $1
        port   = $2
        secure = $3
      else
        host   = 'localhost'
        port   = '8675'
        secure = 'false'
      end
      # Workaround for https://issues.jboss.org/browse/TORQUE-957
      if host == /default-host/
        host = 'localhost'
      end
      @endpoint = { :host => host, :port => port, :secure => secure }
    end
    @endpoint
  end

  def host
    endpoint[:host]
  end

  def port
    endpoint[:port]
  end

  def secure
    endpoint[:secure]
  end

end

get '/' do
  haml :index, :format => :html5
end

