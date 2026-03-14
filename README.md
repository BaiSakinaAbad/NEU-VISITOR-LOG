# **NEU Library Visitor Log: Project Documentation**

**Course:** Software Development 2  
**Institution:** New Era University

---

### **1. Project Overview**

The NEU Library Visitor Log is a modern, web-based application designed to replace the traditional, manual process of logging library entries at New Era University. By digitalizing the visitor logbook, the system provides a seamless and efficient check-in experience for students and faculty while offering powerful administrative tools for real-time monitoring, data analytics, and user management. The application is built to be secure, scalable, and accessible on both desktop and mobile devices, ensuring a smooth transition to a digital-first library management solution.

---

### **2. Problem Statement**

The manual logbook system traditionally used in university libraries presents several significant challenges:

*   **Inefficiency:** Manual entry is time-consuming for both visitors and library staff, leading to queues and delays, especially during peak hours.
*   **Data Inaccuracy:** Illegible handwriting, incomplete entries, and human error compromise the quality and reliability of the collected data.
*   **Limited Analytics:** Extracting meaningful insights from a physical logbook is a laborious, manual process. It is impractical to generate real-time statistics on library usage, peak hours, or popular visit purposes.
*   **Security Concerns:** A physical logbook offers minimal security and no effective way to manage or restrict access for specific individuals.
*   **Physical Wear and Tear:** Logbooks are susceptible to damage, loss, and degradation over time, posing a risk to long-term data preservation.

Digitalizing this process addresses these issues by automating data capture, ensuring data integrity, providing instant analytical capabilities, and enhancing security.

---

### **3. System Architecture**

The application follows a modern, serverless architecture that leverages the Next.js framework on the frontend and Firebase for backend services. The data flow is designed to be secure and efficient.

1.  **Authentication (Firebase Auth):**
    *   The user journey begins at the login screen. Access is restricted to users with a valid `@neu.edu.ph` institutional email address.
    *   Users can authenticate via Google Sign-In or a traditional email/password method.
    *   Firebase Authentication securely manages user sessions and provides a unique UID for each authenticated user.

2.  **Profile & Data Entry (Next.js Frontend & Firestore):**
    *   Upon first login, the system checks for a user profile in the `users` collection in Firestore. If one doesn't exist, it's created automatically.
    *   The user is then directed to an onboarding page to provide their college/office affiliation, which is saved to their user profile.
    *   For subsequent visits, the user selects their purpose(s) for the visit. This creates a new `visit` document within a subcollection under their user profile, linking the visit directly to them.

3.  **Administration & Analytics (Admin Dashboard & Firestore):**
    *   Users with an `admin` role in their Firestore profile are granted access to the Admin Dashboard.
    *   The dashboard fetches and aggregates data from Firestore, including collection group queries on the `visits` subcollection, to generate real-time analytics on visitor counts, peak hours, and popular visit purposes.
    *   Admins can search for users and view their activity logs. They also have the authority to update a user's `isBlocked` status, immediately revoking or restoring their access to the system.

---

### **4. Functional Requirements**

The system is designed with two primary user roles: **User** (students, faculty) and **Admin** (library staff).

#### **User Features:**
*   **Secure Authentication:** Login restricted to institutional `@neu.edu.ph` email accounts.
*   **First-Time Profile Setup:** A one-time onboarding process to capture the user's college or office affiliation.
*   **Visit Logging:** A quick and easy interface to select one or more reasons for their library visit (e.g., Research, Studying, Computer Use).
*   **Personal Dashboard:** View their own visit history, including recent visits and total number of entries.

#### **Admin Features:**
*   **Real-time Analytics Dashboard:**
    *   View key metrics such as total users, today's visitors, and the day's peak visitor hour.
    *   Visualize daily visitor statistics over time.
    *   See breakdowns of visits by college affiliation and top visit purposes.
*   **User Management:**
    *   Search for any registered user by name or email.
    *   View a detailed activity log for any user, showing all their past visits.
*   **Access Control:**
    *   Block or unblock users from the system. A blocked user is immediately prevented from logging in.

---

### **5. Technical Stack**

*   **Framework: [Next.js](https://nextjs.org/)**
    *   Utilizes the App Router for a modern, server-centric architecture. Server Components are used to optimize initial page loads and data fetching.
*   **Styling: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN/UI](https://ui.shadcn.com/)**
    *   Tailwind CSS is used for a utility-first styling approach, enabling rapid and consistent UI development.
    *   ShadCN/UI provides a set of beautifully designed, accessible, and unstyled components that are composed to build the application's UI.
*   **Backend & Authentication: [Firebase](https://firebase.google.com/)**
    *   **Firestore:** A NoSQL, document-based database used to store all application data, including user profiles and visit logs. Its real-time capabilities ensure the admin dashboard is always up-to-date.
    *   **Firebase Authentication:** Handles secure user authentication, supporting both Google Sign-In and email/password providers. It enforces the institutional email domain restriction.
*   **Deployment: [Vercel](https://vercel.com/)**
    *   The application is deployed on Vercel, the platform built by the creators of Next.js. It provides seamless integration, automatic deployments, and a global CDN for optimal performance.

---

### **6. Database Schema**

The Firestore database is structured to be secure and scalable, prioritizing user data ownership.

*   **`users/{userId}`**
    *   This collection stores the primary profile for each user. The document ID (`userId`) is the same as the user's Firebase Authentication UID.
    *   **Fields:**
        *   `id` (string): The user's UID.
        *   `email` (string): The user's institutional email.
        *   `displayName` (string): The user's full name.
        *   `affiliation` (string): The user's college or office.
        *   `role` (string): Either `user` or `admin`.
        *   `isBlocked` (boolean): `true` if the user is blocked, `false` otherwise.
        *   `createdAt`, `updatedAt`, `lastLoginAt` (string): ISO 8601 timestamps.

*   **`users/{userId}/visits/{visitId}`**
    *   This is a **subcollection** nested under each user document. This structure ensures that a user's visit logs are strongly tied to their profile, simplifying security rules.
    *   **Fields:**
        *   `id` (string): The unique ID for the visit.
        *   `userId` (string): The UID of the user who made the visit (denormalized for queries).
        *   `visitDateTime` (string): An ISO 8601 timestamp for when the visit was logged.
        *   `purposeIds` (array of strings): A list of the purposes selected for the visit.

---

### **7. UI/UX Design**

The user interface design is guided by principles of clarity, simplicity, and brand alignment with New Era University.

*   **Color Palette:** The UI prominently features the official NEU colors to create a familiar and professional user experience.
    *   **Primary Green (`#6a994e`):** Used for primary buttons, logos, and key interactive elements to draw user attention.
    *   **Background Cream (`#f2e8cf`):** Used as a warm, neutral background that is easier on the eyes than stark white and provides a sophisticated feel.
*   **Layout & Responsiveness:**
    *   The application employs a clean, card-based layout that organizes information into logical, digestible sections.
    *   A mobile-first approach ensures that the interface is fully responsive and provides an excellent user experience on all devices, from small phones to large desktop monitors.
*   **Component Library:** By leveraging ShadCN/UI, the application maintains a consistent and modern look and feel across all components, from buttons and forms to tables and dialogs.

---

### **8. Security**

Security is a foundational component of the system, implemented at both the application and database levels.

*   **Institutional Access Control:**
    *   The primary security measure is the restriction of access to users with a valid `@neu.edu.ph` email address. This is enforced at the point of sign-up and sign-in. Any attempt to use a non-institutional email is rejected.
*   **Role-Based Access Control (RBAC):**
    *   Firestore Security Rules are used to enforce a clear separation of privileges.
    *   Standard users can only read and write their own data (`/users/{userId}` and their own `visits` subcollection). They cannot see or modify other users' information.
    *   Admin users are granted read access across the database to power the analytics dashboard and user management features.
*   **User Blocking:**
    *   The `isBlocked` boolean flag in a user's profile serves as a master switch for their access.
    *   At login, the system checks this flag. If `true`, the login process is halted, and the user is informed that their account is blocked, effectively preventing them from accessing any part of the application. This action can only be performed by an administrator.
