Feature: Search for assets
  In order to keep find assets
  A user in the "IT" group should be able to find assets by searching on serial number and asset number

  Background:
    Given I am authenticated
    And I am in the "IT" group
    And the following assets exist:
      | Asset number  | Serial number | Name          |
      | 1             | JA-123        | Joshua Abbott |
      | 2             | RR-123        | Ryan Rabon    |
    And the Sphinx indexes are updated

  Scenario: Search for an asset
    Given I am on the home page
    And I follow "Manage Assets"
    And I fill in "Search" with "JA"
    And I press "Search"
    Then I should see "Joshua Abbott"
    And I should not see "Ryan Rabon"
