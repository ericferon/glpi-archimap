Feature: Define diagram's metadata (name, owner, ...)
	As a GLPI user,
	I need first to create, modify, duplicate or delete a diagram's metadata

Background:
#		Given I'm logged as user "test" with password "aut0test"
        Given I am on "/"
        When I fill in "Login" with "test"
        When I fill in "Password" with "aut0test"
        When I press "Post"
        Then I should be on "/front/central.php"

#		Given I'm authorized to fully use Diagrams
@javascript
	Scenario: Checking access to the menu
        When I hover over the menu "Assets"
        Then I should see the menu "Diagrams"
        
	Scenario: Checking access to the Add button
        Given I am on "/plugins/archimap/front/graph.php"
        Then I should see the link "Add"

@javascript
	Scenario: Creating a new diagram
		Given I am on "/plugins/archimap/front/graph.php"
		When I follow "Add"
		Then I am on "/plugins/archimap/front/graph.form.php"
		And I should see the field "name"
		And I should see the field "shortdescription"
		And I should see the field "plugin_archimap_graphtypes_id"
		And I should see the field "groups_id"
		And I should see the field "users_id"
        And I should see the button "Add"
		And I fill in "name" with "Test Behat-Mink"
		And I fill in "shortdescription" with "Test Behat-Mink : short description"
		And I select option "1 - Domain Map" from combobox "plugin_archimap_graphtypes_id"
		And I select option "test" from combobox "groups_id"
		And I select option "test" from combobox "users_id"
		And I press "Add"
		And I should see a message "Item successfully added:"

@javascript
	Scenario: Modifying an existing diagram
		Given I am on "/plugins/archimap/front/graph.php"
		When I search on "Name" from combobox "criteria[0][field]"
		And I fill in "criteria[0][value]" with "Test Behat-Mink"
		And I press "Search"
		And I follow "Test Behat-Mink"
		Then I should see the field "name"
		And I fill in "name" with "Test Behat-Mink modified"
		And I press "Save"
		And I should see a message "Item successfully updated:"

@javascript
	Scenario: Duplicating an existing diagram
		Given I am on "/plugins/archimap/front/graph.php"
		When I search on "Name" from combobox "criteria[0][field]"
		And I fill in "criteria[0][value]" with "Test Behat-Mink modified"
		And I press "Search"
		Then I check search result 1
		And I select massive action "Duplicate"
		And I press "Post"
		And I should see a message "Operation successful"
		
@javascript
	Scenario: Deleting an existing diagram
		Given I am on "/plugins/archimap/front/graph.php"
		When I search on "Name" from combobox "criteria[0][field]"
		And I fill in "criteria[0][value]" with "Test Behat-Mink modified"
		Then I press "Search"
		And I check search result 2
		And I select massive action "Put in dustbin"
		And I press "Post"
		And I should see a message "Operation successful"
		Then I click on ".lever"
		And I check search result 1
		And I select massive action "Delete permanently"
		And I press "Post"
		And I should see a message "Operation successful"

