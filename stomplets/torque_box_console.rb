# Copyright 2012 Lance Ball
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

require 'pry'
require 'torquebox'
require 'torquebox-stomp'
require 'torquebox-cache'
require 'torquebox-console'

class TorqueBoxConsole
  extend TorqueBox::Injectors

  def configure( options )
    @cache = TorqueBox::Infinispan::Cache.new(:name=>"torquebox-console")
    @consoles = {}
  end

  def on_message( message, session )
    console = @consoles[session["console_id"]]
    logger.error("No console found for the current session #{session.inspect}")
  end

  def on_subscribe( subscriber )
    session = subscriber.session
    session["console_id"] = @cache.increment( "console_id" )
    server = TorqueBox::Console::Server.new( subscriber )
    @consoles[session["console_id"]] = server
    logger.info "Initializing torquebox-console service for console #{session["console_id"]}"
    subscriber.send("Welcome to TorqueBox Console")
    server.run
  end
 
  def on_unsubscribe( subscriber )
    session = subscriber.session
    logger.info "Closing torquebox-console service for console #{session["console_id"]}"
    @consoles.delete( session["console_id"] )
  end

  def logger
    @logger ||= TorqueBox::Logger.new( self )
  end

  class << self

    def service_registry
      @@service_registry ||= inject("service-registry")
    end

    def list_runtimes
      get_runtimes.each do |runtime| 
        puts "Application: #{runtime[0]}"
        puts "Pool: #{runtime[1]}"
      end
    end

    def get_runtimes
      service_registry.service_names.to_a.map { |x| parse_pool_name(x) }.reject(&:nil?)
    end

    def parse_pool_name(service_name)
      [$1, $3, service_name] if service_name.canonical_name =~
        /"(.*)(-knob\.yml|\.knob)"\.torquebox\.core\.runtime\.pool\.([^.]+)$/
    end
  end
end
