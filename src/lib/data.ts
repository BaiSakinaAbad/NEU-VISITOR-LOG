import type { User, Visit, DailyStats } from '@/lib/types';
import { subDays, format } from 'date-fns';

export const mockUsers: User[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex.j@neu.edu', affiliation: 'College of Engineering', isBlocked: false, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
  { id: '2', name: 'Maria Garcia', email: 'maria.g@neu.edu', affiliation: 'College of Science', isBlocked: false, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: '3', name: 'James Smith', email: 'james.s@neu.edu', affiliation: 'D\'Amore-McKim School of Business', isBlocked: true, avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
  { id: '4', name: 'Patricia Brown', email: 'patricia.b@neu.edu', affiliation: 'College of Arts, Media and Design', isBlocked: false, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
  { id: '5', name: 'John Doe', email: 'john.d@neu.edu', affiliation: 'Information Technology Services', isBlocked: false, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
];

export const mockVisits: Visit[] = [
  { id: 'v1', userId: '1', date: subDays(new Date(), 1).toISOString(), purposes: ['Research', 'Studying'] },
  { id: 'v2', userId: '1', date: subDays(new Date(), 3).toISOString(), purposes: ['Reading'] },
  { id: 'v3', userId: '2', date: subDays(new Date(), 2).toISOString(), purposes: ['Computer Use'] },
  { id: 'v4', userId: '1', date: subDays(new Date(), 5).toISOString(), purposes: ['Studying', 'Computer Use'] },
];

export const mockDailyStats: DailyStats[] = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), i), 'MMM d'),
  visitors: Math.floor(Math.random() * (150 - 50 + 1)) + 50,
})).reverse();

export const visitPurposes = ['Reading', 'Research', 'Computer Use', 'Studying'];

export const affiliations = [
    "College of Engineering",
    "College of Science",
    "D'Amore-McKim School of Business",
    "College of Arts, Media and Design",
    "Bouvé College of Health Sciences",
    "College of Social Sciences and Humanities",
    "Khoury College of Computer Sciences",
    "School of Law",
    "Information Technology Services",
    "Other Staff/Office"
];
