require 'resque/tasks'
require 'resque_scheduler/tasks'

namespace :resque do
  task :setup do
    require 'resque'
    require 'resque_scheduler'
    require 'resque/scheduler'
    Resque::Scheduler.dynamic = true
    Resque.schedule = YAML.load_file(File.join(File.dirname(__FILE__), '..', '..', 'config', 'schedule.yml'))
  end
end