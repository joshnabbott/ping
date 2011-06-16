module Vpim
  class Vcard
    class Maker
      def aim=(value)
        @card << Vpim::DirectoryInfo::Field.create('X-AIM', value.to_str);
      end

      # def department=(value)
      #   @card << Vpim::DirectoryInfo::Field.create('X-DEPARTMENT', value.to_str);
      # end

      def gender=(value)
        @card << Vpim::DirectoryInfo::Field.create('X-GENDER', value.to_str);
      end

      def gtalk=(value)
        @card << Vpim::DirectoryInfo::Field.create('X-GTALK', value.to_str);
      end

      def skype=(value)
        @card << Vpim::DirectoryInfo::Field.create('X-SKYPE', value.to_str);
      end
    end
  end
end
