Feature: Manage assets
  In order to manage assets
  An IT admin wants to create, update, and delete asset records
  And the asset form fields should change depending on the Kind selected.

  Background:
    Given I am authenticated
    And I am in the "IT" group

  Scenario: I should always see fields when registering an asset
    Given I am on the new asset page
    Then I should see "Asset"
    And I should see "Asset number" within "#asset"
    And I should see "Kind" within "#asset"
    And I should see "Serial number" within "#asset"
    And I should see "Name" within "#asset"
    And I should see "Model" within "#asset"
    And I should see "Manufacturer" within "#asset"
    And I should see "Warranty end date" within "#asset"
    And I should see "Warranty number" within "#asset"
    And I should see "Warranty renewal date" within "#asset"

    And I should see "Tracking"
    And I should see "Assignment" within "#tracking"
    And I should see "Status" within "#tracking"
    And I should see "Location" within "#tracking"
    And I should see "Notes" within "#tracking"

    And I should see "Purchasing"
    And I should see "Purchase date" within "#purchasing"
    And I should see "Purchase type" within "#purchasing"
    And I should see "PO number" within "#purchasing"

    And I should see "Transfer"
    And I should see "Transfer type" within "#transfer"
    And I should see "New assignment" within "#transfer"
    And I should see "Transfer date" within "#transfer"
    And I should see "Sale price" within "#transfer"
    And I should see "Payment type" within "#transfer"
    And I should see "Notes" within "#transfer"

  Scenario: Default kind should be set to "Computer" when creating a new asset
    Given I am on the assets page
    And I follow "Create a new asset"
    Then the "Kind" field should contain "computer"
    And I should see "Model"
    And I should see "Serial number"
    And I should see "Processor speed"
    And I should see "Processor type"
    And I should see "Total RAM"
    And I should see "MAC address 1"
    And I should see "MAC address 2"
    And I should see "Operating system version"
    And I should see "Battery health"
    And I should see "Uptime"
    And I should see "Partition size"
    And I should see "Partition name"
    And I should see "Partition % used"

  @javascript
  Scenario: Form fields should change when "Kind" changes
    Given I am on the new asset page
    And I select "Phone" from "Kind"
    Then "Processor speed" should not be visible
    And I should see "Size"
    And I should see "Carrier info"
    And I should see "Phone number"

  Scenario: Delete an asset
    Given the following assets exist:
      | Asset number | Serial number | Name          | Model       | Manufacturer |
      | 1            | 1234567890    | Joshua Abbott | Macbook Pro | Apple        |
    When I go to the assets page
    And I follow "Destroy" within the asset with the asset_number "1"
    Then I should not see "1234567890"