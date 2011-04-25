Feature: Manage people
  In order to keep accurate information on people
  An admin wants to create, update, and delete people

  Background:
    Given I am authenticated
    And I am in the "IT" group
    And I am in the "HR" group
  
  Scenario: Register a new person
    Given I am on the new person page
    And I fill in the following:
      | First name                  | John                        |
      | Middle name                 | Q                           |
      | Last name                   | Smith                       |
      | Title                       | Developer                   |
      | Job title                   | Developer                   |
      | Work email address          | john.smith@factorylabs.com  |
      | Work phone number           | 123-567-7890                |
      | Work fax number             | 123-567-7890                |
      | Work mobile number          | 123-567-7890                |
      | Work extension              | 123                         |
      | Work address                | 158 Fillmore                |
      | Work city                   | Denver                      |
      | Work state                  | CO                          |
      | Work zip                    | 80206                       |
      | Nickname                    | Johnny                      |
      | Bio                         | I am a developer            |
      | Personal email address      | john.smith@factorylabs.com  |
      | Home phone number           | 123-567-7890                |
      | Home fax number             | 123-567-7890                |
      | Home mobile number          | 123-567-7890                |
      | Home address                | 158 Fillmore                |
      | Home city                   | Denver                      |
      | Home state                  | CO                          |
      | Home zip                    | 80206                       |
      | Emergency contact name      | Joan Smith                  |
      | Emergency contact number    | 123-456-7891                |
      | Emergency contact relation  | Mother                      |
      | Seating floor               | 2                           |
      | Seating number              | 100                         |
      | Building card               | 931742389y32894             |
      | Garage card                 | 128473874320482             |
      | FedEx Account               | 237438297493242             |
      | Default username            | john.smith                  |
      | AIM                         | factoryjsmith               |
      | Skype                       | factoryjsmith               |
      | Google Talk                 | john.smith@factorylabs.com  |
    And I select "Male" from "Gender"
    And I select "Salaried" from "Pay type"
    And I select "IS" from "Department"
    And I select "USA" from "Home country"
    And I select "USA" from "Work country"
    And I select "4/11/2010" as the date for "person_hr_profile_attributes_hire_date"
    And I select "4/11/2010" as the date for "person_hr_profile_attributes_departure_date"
    And I select "4/11/2010" as the date for "person_hr_profile_attributes_birthday"
    And I press "Create"
    Then I should see "Person was successfully created."
    And I should see "john.smith"
    
  Scenario: Update a person
    Given the following hr profiles exist:
      | First Name  |  Last Name |
      | Joe         |  Smith     |
    Given the following people exist:
      | HR Profile        |
      | First Name: Joe   |
    And I am on the people page
    And I follow "Edit" within the 2nd person
    And I fill in "Default username" with "joe.smith"
    And I press "Update"
    Then I should see "Person was successfully updated."
    And I should see "joe.smith"

  Scenario: Delete a person
    Given the following hr profiles exist:
      | First Name  |  Last Name |
      | Joe         |  Smith     |
    Given the following people exist:
      | HR Profile        |
      | First Name: Joe   |
    Given I am on the people page
    And I follow "Destroy" within the 2nd person
    Then I should not see "joe.smith"