// Types based on docs/backend.json

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    affiliation: string;
    role: 'user' | 'admin';
    isBlocked: boolean;
    createdAt: string;
    updatedAt?: string;
    lastLoginAt: string;
}

export interface VisitPurpose {
    id: string;
    name: string;
    description: string;
}

export interface Visit {
    id: string;
    userId: string;
    visitDateTime: string;
    purposeIds: string[];
    welcomeMessage: string;
}
