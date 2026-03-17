/**
 * @fileoverview A list of email addresses for automatic admin promotion.
 *
 * This file contains a list of email addresses that will be automatically assigned
 * the 'admin' role upon their first login. This is intended for bootstrapping
 * the initial administrator account(s).
 *
 * SECURITY WARNING:
 * This list is included in the client-side JavaScript bundle, making the email
 * addresses visible to anyone who inspects the application's code. For long-term
 * security, it is strongly recommended to:
 * 1. Use this list only for the initial setup.
 * 2. Remove the email address from this list after the administrator has logged
 *    in for the first time.
 * 3. Manage all future administrator roles directly in the Firestore database.
 */
export const ADMIN_EMAILS: string[] = ['baisakina.abad@neu.edu.ph'
  // Add the full email address of the user you want to be an admin.
  // For example: 'your-admin-email@neu.edu.ph'
];
