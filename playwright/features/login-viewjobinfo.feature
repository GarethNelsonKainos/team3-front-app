Feature: Login and view job information
  As a visitor I want to login and view 
  active job roles and job role information

  Scenario: User can log in using their credentials and view job role information
    Given I am on the login page
    When I enter valid credentials
    Then I click the login button
    Then I should be redirected to the open job roles page
    Then I should see a list of active job roles
    When I click on a job role
    Then I should see the job role information details