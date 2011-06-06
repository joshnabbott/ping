web:    bundle exec unicorn -c config/unicorn.rb
sphinx: bundle exec rake ts:run_in_foreground
resque: VERBOSE=true QUEUE=* bundle exec rake environment resque:work
scheduler: VERBOSE=true bundle exec rake resque:scheduler