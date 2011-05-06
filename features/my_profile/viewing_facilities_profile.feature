Feature: View my facilities profile
  In order to audit their facilities information
  A user should be able to view their facilities profile

  Background:
    Given I am authenticated

  Scenario: View my facilities profile
    Given my facilities profile has the following attributes:
      | Seating floor               | 2                           |
      | Seating number              | 100                         |
      | Building card               | 931742389y32894             |
      | Garage card                 | 128473874320482             |
      | Fed Ex Account              | 237438297493242             |
    When I am on the home page
    And I follow "My Profile"
    And I follow "View my facilities profile"
    Then I should see "Your Facilities Profile"
    And I should see "Seating Floor 2"
    And I should see "Seating Number 100"
    And I should see "Building Card 931742389y32894"
    And I should see "Garage Card 128473874320482"
    And I should see "FedEx Account 237438297493242"