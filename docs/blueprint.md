# **App Name**: NEU Library Visitor Log

## Core Features:

- Institutional Email Login: Users authenticate using their NEU Google-based institutional email. The system supports email/password and Google Sign-In for secure access.
- First-Time Visitor Onboarding: Upon their initial visit, users are prompted via a UI to specify their college or office affiliation, which is then stored for future visits.
- Visit Purpose Selection: For every subsequent entry, users select their reason(s) for visiting the library (e.g., reading, research, computer use, studying) from a predefined list displayed in the UI.
- Personalized User Dashboard: Regular users access a dashboard displaying a 'Welcome {username}' message, their recent visit details, and the total number of times they've logged in during the current month, as well as the current number of visitors logged in for the day.
- Admin Statistics & User Search: Administrators can view real-time daily visitor counts, search for specific users, and access summarized visit statistics filtered by custom date ranges (weekly, monthly) via a dedicated UI.
- Admin User Management Tool: Admins have the capability to block specific users through the UI, preventing them from further accessing the library system.
- AI-Powered Greeting and Logging Tool: After successful authentication and purpose selection, the system utilizes an AI tool to generate a 'Welcome to NEU Library!' message and intelligently logs all visit details using a structured database schema.
- Daily Visitor Count Reset: The visitor count displayed in the user dashboard and admin statistics will automatically reset every day at 11:59 PM.

## Style Guidelines:

- Primary Color: Muted forest green (#6a994e). This color signifies growth, academia, and a calm, focused environment, aligning with the university's mission. It will be used for interactive elements and key headers.
- Background Color: Very light cream (#f2e8cf). This soft, warm background ensures excellent readability for text and provides a 'clean and fresh' foundation for the overall UI.
- Accent Color: Vibrant lime-yellow (#B8C716). This color provides a 'fresh' and energetic pop, drawing attention to critical actions, notifications, and interactive elements, analogous to the primary green.
- Text Color: Pure black (#000000) for all primary text content, ensuring maximum contrast and readability on the light cream background.
- Headline and Body Font: 'Inter' (sans-serif). A modern, clean, and highly readable typeface suitable for all text elements, from dashboard statistics to login prompts, maintaining a fresh and objective aesthetic.
- Icons will feature clean lines and a modern, academic theme. Utilize widely recognized symbols for navigation, user profiles, and administrative actions to ensure clarity and ease of use.
- An adaptive UI layout ensuring a seamless experience across web and mobile devices. Use a card-based system for displaying information chunks (e.g., visitor stats, personal visit logs) to maintain a clean and organized appearance.
- Subtle and fluid animations for transitions between pages, form submissions, and data updates. This provides a polished user experience without being distracting, enhancing the 'fresh' feel.