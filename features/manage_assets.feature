Feature: Manage assets
  In order to manage assets
  An IT admin wants to create, update, and delete asset records

  Background:
    Given I am authenticated
    And I am in the "IT" group

  Scenario: Register a new asset
    Given I am on the assets page
    And I follow "Create a new asset"
    When I fill in the following:
      | Asset number  | 1             |
      | Serial number | 1234567890    |
      | Name          | Joshua Abbott |
      | Model         | MacBook Pro   |
      | Manufacturer  | Apple         |
    And I select "Laptop" from "Kind"
    And I select "Active" from "Status"
    And I press "Create"
    Then I should see "Asset was successfully created."
    And I should see "1234567890"

  Scenario: Update an asset
    Given the following assets exist:
      | Asset number | Serial number | Name          | Model       | Manufacturer |
      | 1            | 1234567890    | Joshua Abbott | Macbook Pro | Apple        |
    And I am on the assets page
    And I follow "Edit" within the asset with the asset_number "1"
    And I fill in "Serial number" with "0987654321"
    And I press "Update Asset"
    Then I should see "Asset was successfully updated."
    And I should see "0987654321"

  Scenario: Delete an asset
    Given the following assets exist:
      | Asset number | Serial number | Name          | Model       | Manufacturer |
      | 1            | 1234567890    | Joshua Abbott | Macbook Pro | Apple        |
    When I go to the assets page
    And I follow "Destroy" within the asset with the asset_number "1"
    Then I should not see "1234567890"