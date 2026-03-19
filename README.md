# **NEU Library Visitor Log: Project Documentation**

**Course:** Software Development 2  
**Institution:** New Era University

**Live app link**: https://neu-visitor-log.vercel.app

---
## **1. Project Overview**
The NEU Library Visitor Log is a modern, web-based application designed to replace the traditional, manual process of logging library entries at New Era University. By digitalizing the visitor logbook, the system provides an efficient check-in experience for students and faculty while offering administrative tools for real-time monitoring, data analytics, and user management. The application is built accessible on both desktop and mobile devices.

## **2. Problem Statement**
Inefficiency: Manual entry is time-consuming for library visitors, leading to queues and delays, especially during peak hours.
**Data Inaccuracy**: Illegible handwriting, incomplete entries, and human error compromise the quality and reliability of the collected data.
**Limited Analytics**: Extracting meaningful insights from a physical logbook is a laborious, manual process. It is impractical to generate real-time statistics on library usage, peak hours, or popular visit reasons.
**Security Concerns**: A physical logbook offers minimal security and no effective way to manage or restrict access for specific individuals.
**Physical Wear and Tear**: Logbooks are susceptible to damage, loss, and degradation over time, posing a risk to long-term data preservation.
Digitalizing this process addresses these issues by automating data capture, ensuring data integrity, providing instant analytical capabilities, and enhancing security.

## **3. System Architecture**
The application follows a modern, serverless architecture that leverages the Next.js framework on the frontend and Firebase for backend services. The data flow is designed to be secure and efficient.

**Profile & Data Entry**:
Upon first login, the system checks for a user profile in the users collection in Firestore. If one doesn't exist, it's created automatically.
The user is then directed to an onboarding page to provide their college/office affiliation, which is saved to their user profile.
For subsequent visits, the user selects their purpose(s) for the visit. This creates a new visit document within a subcollection under their user profile, linking the visit directly to them.

**Administration & Analytics**:
Users with an admin role in their Firestore profile are granted access to the Admin Dashboard.
The dashboard fetches and aggregates data from Firestore, including collection group queries on the visits subcollection, to generate real-time analytics on visitor counts, peak hours, and popular visit purposes.
Admins can search for users and view their activity logs. They also have the authority to update a user's isBlocked status, immediately revoking or restoring their access to the system.

## **4. Functional Requirements**
The system is designed with two primary user roles: User (students, faculty) and Admin (library staff).

**User Features**:

**Secure Authentication**: Login restricted to institutional @neu.edu.ph email accounts.
**First-Time Profile Setup**: A one-time onboarding process to capture the user's college or office affiliation.
**Visit Logging**: A quick and easy interface to select one or more reasons for their library visit (e.g., Research, Studying, Computer Use).
**Personal Dashboard**: View their own visit history, including recent visits and total number of entries.

**Admin Features**:

**Real-time Analytics Dashboard**:
View key metrics such as total users, today's visitors, and the day's peak visitor hour.
Visualize daily visitor statistics over time.
See breakdowns of visits by college affiliation and top visit purposes.

**User Management**:
Search for any registered user by name or email.
View a detailed activity log for any user, showing all their past visits.

**Access Control**:
Block or unblock users from the system. A blocked user is immediately prevented from logging in.



### **Deployment**: Vercel
The application is deployed on Vercel, the platform built by the creators of Next.js. It provides seamless integration, automatic deployments, and a global CDN for optimal performance.
