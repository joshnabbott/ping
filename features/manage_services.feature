Feature: Manage services
  In order to provision services across users
  An admin wants to create, update, and delete services

  Background:
    Given I am authenticated
    And I am in the "IT" group

  Scenario: Register a new service
    Given I am on the services page
    And I follow "Create a new service"
    And I fill in "Name" with "Google Apps"
    And I press "Create"
    Then I should see "Service was successfully created."
    And I should see "Google Apps"

  Scenario: Register a new service with a blank name
    Given I am on the services page
    And I follow "Create a new service"
    And I press "Create"
    Then I should not see "Service was successfully created."
    And I should see "Can't be blank"

  Scenario: Update a service
    Given the following services exist:
      | Name        |
      | Google Apps |
    And I am on the services page
    And I follow "Edit" within the service with the name "Google Apps"
    And I fill in "Name" with "Google Docs"
    And I press "Update Service"
    Then I should see "Service was successfully updated."
    And I should see "Google Docs"

  Scenario: Delete a service
    Given the following services exist:
      | Name        |
      | Google Apps |
    When I go to the services page
    And I follow "Destroy" within the service with the name "Google Apps"
    And I should be on the services page
    Then I should not see "Google Apps"