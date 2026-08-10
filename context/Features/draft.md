

#  Add Landing Page
## Overview
Simple login with splash image and buttons to 'View Sandwiches' 'View Food Items' 'Login' 
View Sandwiches will open the sandwiches menu. View Food Items will open the other menu. The Login will allow the user to enter credentials and if successful will be a backend where item name, pictures, and prices can be added or adjusted. The actual implementation of the login is an entire different feature. For now, just having an initial landing and buttons to take the menu is fine.

# Cleanup Unused code
## Overview
There is a lot of unused code from previous iterations. It would be great to remove what is no longer being used.


# Migrate database from ASP.NET to Neon Postgres
## Overview
Can the database fetch and endpoints be moved from ASP.net into Postgres and handled by neon and prism? Walk me through it, comments in the code since I am new to the platform.



# Log in and Edit
## Overview
Would need a login to get to the admin section to allow for menu item updates and adding items. First work on updating prices and descriptions, then images.


# Hosting
## Overview
This needs to be accessible online


# Video Export
## Overview
I will paste screen shots of what is displayed on both menus. I need a 5 second video export of the current data of each screen.


# Remodel the Admin Page
## Overview
The admin page to edit must be renovated. Please refer to the @context/Features/screenshots/edit-page-update.png


# Reorder Items
## Overview
Can the items be rearranged from the admin screen. Not just sandwiches but any item.



# Mobile Responsivness Updgrades
## Overview
The mobile screen for the sandwiches and items needs some work. For the sandwiches screen, its not too bad for mobile but the background does not extend to cover all of the sandwich display boxes. I need in the top right to be an options button, or hamburger" to open up a list of screens to navigate to which should only be 'View Sandwiches', 'View Other Food', and 'Login'.

The /items screen is not responsive at all. The images for this don't need to be displayed. Each section just needs to be able to scrolled through. Also this needs the options button top left doing the same for the other screen.

For the /edit screen, the .admin-sidebar doesn't need to be displayed since the navigation can be handled with the .admin-pill buttons. However, there still needs to be the Logout, View Sandwiches and View Other Items buttons. Place these within that options button top right would be fine.


# Manual navigation to /anything returns Not Found
## Overview
When I try to manually navigate to square-deli.onreader.com/sandwiches, square-deli.onreader.com/items, or square-deli.onreader.com/sandwiches, or square-deli.onreader.com/edit I get a Not Found. But when I press the space bar or 'e' button it navigates correctly to the proper page. 