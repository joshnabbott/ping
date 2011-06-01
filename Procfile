web:    bundle exec unicorn -c config/unicorn.rb
sphinx: bundle exec rake ts:run_in_foreground
resque: QUEUE=* bundle exec rake environment resque:work
scheduler: bundle exec rake resque:scheduler