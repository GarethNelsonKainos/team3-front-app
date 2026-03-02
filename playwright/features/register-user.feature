Feature: Register a new user
  As a visitor
  I want to fill in my email and password on the registration
  So that I can register as a new user

  Scenario: User can register an account
    Given I am on the registration page
    Given I have entered valid personal information
    When I click Sign Up
    Then I should be redirected to the login page
    Then I should see a successful registration notice
