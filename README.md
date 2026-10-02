**Tool Documentation & Handover Notes**
**Purpose**

The purpose of this tool is to support onboarding sessions, workshops, and training activities based on the BMC consulting simulation concept "Typical Consulting Week".

Participants build a realistic consulting work week by scheduling consulting activities within a weekly calendar. After creating their schedule, participants can evaluate their solution using the integrated scoring mechanism.

Multiple valid solutions are possible.

**Technical Setup**

This application consists of a single HTML file containing:

HTML structure
CSS styling
JavaScript functionality

No external libraries, frameworks, databases, APIs, or server-side services are required.

The entire application runs locally inside the browser.

**Main Features**
Drag-and-drop activity planning
Weekly consulting schedule simulation
Activity usage limits
Automatic overlap detection
Save and load functionality
Integrated "Consulting Week Health Score"
Automated recommendation generation
Fully client-side execution

**Running the Tool**
**Recommended Option**

Open the published GitHub Pages link in a modern web browser.

No installation is required.

**Alternative Option**

Open the HTML file directly in a browser:

index.html

The application will run locally without any additional setup.

Recommended browsers:

Microsoft Edge
Google Chrome
Mozilla Firefox

**Data Storage**

The tool does not store any information centrally.

All saved planning data is stored locally within the user's browser using Local Storage.

Important implications:

Saved schedules are browser-specific
Saved schedules are device-specific
Clearing browser data removes saved schedules
Data is not shared between users
Structure of the Source Code

The code is organized into the following functional sections:

Configuration
Categories
Activities
Application State & Helpers
Inventory Management
Drag & Drop Functionality
Calendar Generation
Event Management
Activity Library Generation
Save & Load Functions
Evaluation Logic
Initialization

The code was intentionally implemented without external dependencies to simplify maintenance and future modifications.

**Modifying Activities**

Each activity contains:

Activity ID
Display Name
Category
Maximum Number of Uses
Duration (Minutes)

**Modifying Categories**

This section controls:

Category names
Grouping within the activity library
Category colors

**Modifying the Evaluation Logic**

The current evaluation dimensions are:

Client Impact
Team Collaboration
Analysis & Delivery
Learning & Internal Development
Sustainability

The scoring logic can easily be adapted for future workshop concepts.

**Design Principles**

The following design decisions were made intentionally:

No backend required
No user accounts required
No database required
No cloud storage required
Single-file architecture
Easy distribution and maintenance

The goal was to create a lightweight tool that can run independently without any infrastructure dependencies.

**Future Maintenance**

When extending or modifying the tool, it is recommended to:

Keep the application dependency-free
Maintain the current code structure
Document major functional changes
Review the evaluation logic when adding or removing activities
Test drag-and-drop functionality after modifications

The code has been structured into clearly separated functional sections to support future maintenance.
