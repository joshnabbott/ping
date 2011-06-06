require 'resque/server'

Resque::Scheduler.dynamic = true
Resque.schedule = YAML.load_file(File.join(File.dirname(__FILE__), '..', 'schedule.yml'))