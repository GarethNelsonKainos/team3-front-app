Feature: Login page navigation
  As a visitor
  I want to navigate from the home page to login
  So that I can sign in

  Scenario: User can navigate from home to login page
    Given I am on the home page
    When I click the login link
    Then I should see the login page
