Feature: View my work profile
  In order to audit their work contact information
  A user should be able to view their work profile

  Background:
    Given I am authenticated

  Scenario: View my work profile
    Given my work profile has the following attributes:
      | Work phone number           | 123-567-7890                |
      | Work fax number             | 123-567-7890                |
      | Work mobile number          | 123-567-7890                |
      | Work extension              | 123                         |
      | Work address                | 158 Fillmore                |
      | Work city                   | Denver                      |
      | Work state                  | CO                          |
      | Work zip                    | 80206                       |
      | Work country                | USA                         |
    When I am on the home page
    And I follow "Manage My Information"
    And I follow "Work Contact Profile"
    Then I should see "Work Phone Number 123-567-7890"
    And I should see "Work Fax Number 123-567-7890"
    And I should see "Work Mobile Number 123-567-7890"
    And I should see "Work Extension 123"
    And I should see "Work Address 158 Fillmore"
    And I should see "Work City Denver"
    And I should see "Work State CO"
    And I should see "Work Zip 80206"
    And I should see "Work Country USA"