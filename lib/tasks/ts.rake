namespace :ts do
  task :run_in_foreground => [ 'ts:conf', 'ts:in' ] do
    ts = ThinkingSphinx::Configuration.instance

    # Workaround to make Sphinx die nicely:
    #   - PTY.spawn invokes bash -c under the covers
    #   - Which turns SIGTERM into SIGHUP (not sure exactly why, can't seem to find a reason)
    #   - Which sphinx interprets as a reload instead of a quit
    #   - So, we need to remap HUP to KILL for the purposes of this script.
    # Ugh.  Shoot me.

    unless pid = fork
      exec "#{ts.bin_path}#{ts.searchd_binary_name} --pidfile --config #{ts.config_file} --nodetach"
    end

    trap("SIGHUP") { Process.kill(:TERM, pid) }
    Process.wait

  end
end
