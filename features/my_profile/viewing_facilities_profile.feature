Feature: View my facilities profile
  In order to audit their facilities information
  A user should be able to view their facilities profile

  Background:
    Given I am authenticated

  Scenario: View my facilities profile
    Given my facilities profile has the following attributes:
      | Seating floor               | Floor 2                     |
      | Seating number              | 222                         |
      | Building card               | 931742389y32894             |
      | Garage card                 | 128473874320482             |
      | Fed Ex Account              | 237438297493242             |
    When I am on the home page
    And I follow "Manage My Information"
    And I follow "Facilities Profile"
    Then I should see "Seating Floor Floor 2"
    And I should see "Seating Number 222"
    And I should see "Building Card 931742389y32894"
    And I should see "Garage Card 128473874320482"
    And I should see "FedEx Account 237438297493242"