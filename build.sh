#!/bin/bash

# Add the homebrew path
export PATH="/usr/local/bin:/usr/local/sbin:$PATH"

# Load RVM into a shell session *as a function*
# First try to load from a user install
if [[ -s "$HOME/.rvm/scripts/rvm" ]] ; then
  source "$HOME/.rvm/scripts/rvm"
# Then try to load from a root install
elif [[ -s "/usr/local/rvm/scripts/rvm" ]] ; then
  source "/usr/local/rvm/scripts/rvm"
else
  printf "ERROR: An RVM installation was not found.\n"
fi

# Setup the gemset
rvm use ree@factorypeople --create && \
rvm --force gemset empty && \
rvm get head && \
rvm reload && \
rvm rubygems 1.3.6

# REE Tweaks
export RUBY_HEAP_MIN_SLOTS=1000000
export RUBY_HEAP_SLOTS_INCREMENT=1000000
export RUBY_HEAP_SLOTS_GROWTH_FACTOR=1
export RUBY_GC_MALLOC_LIMIT=1000000000
export RUBY_HEAP_FREE_MIN=500000

# Setup bundler
gem install bundler -v 1.0.10 --no-ri --no-rdoc
bundle install && \

# DB Setup
cp config/database.example.yml config/database.yml && \
bundle exec rake db:create:all && \
bundle exec rake db:migrate && \

# Build
bundle exec rake cucumber

# Deploy
#eval `ssh-agent -s` && \
#chmod 600 config/keypair/id_rsa && \
#ssh-add config/keypair/id_rsa && \
#EYRC=ey.yml bundle exec ey deploy --verbose --no-migrate -r master -e oakley_ocp_central_dispatch_production
BUILD_RESULTS=$?

# DB Cleanup

# Finalize
exit $BUILD_RESULTS