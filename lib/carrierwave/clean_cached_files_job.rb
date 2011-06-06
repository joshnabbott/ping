class CarrierWave::CleanCachedFilesJob
  def self.perform
    CarrierWave.clean_cached_files!
  end
end