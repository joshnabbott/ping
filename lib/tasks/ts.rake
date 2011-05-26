namespace :ts do
  task :run_in_foreground => [ 'ts:conf', 'ts:in' ] do
    ts = ThinkingSphinx::Configuration.instance
    exec "script/pswrap #{ts.bin_path}#{ts.searchd_binary_name} --pidfile --config #{ts.config_file} --nodetach"
  end
end
