Given 'the Sphinx indexes are updated' do
  # Update all indexes
  ThinkingSphinx::Test.index
  # Wait for Sphinx to catch up
  sleep(0.25)
end