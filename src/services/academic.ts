import { isSupabaseConfigured, requireSupabaseConfig, supabase } from '../lib/supabase';

const demoFileUrl = (content: string) => `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

const demoResources: AcademicResource[] = [
  {
    id: 'demo-note-1',
    title: 'Calculus I Revision Notes',
    description: 'Summary of derivatives, limits, and integration practice questions.',
    university: 'University of Dar es Salaam',
    course: 'Mathematics',
    category: 'Notes',
    fileUrl: demoFileUrl('Calculus I Revision Notes\n\nLimits and continuity\nA limit describes the value a function approaches as x approaches a given point. Check one-sided limits when a function is piecewise.\n\nDerivatives\nThe power rule is d/dx(x^n) = n*x^(n-1). Use the product rule for products and the chain rule for a function inside another function.\n\nIntegration\nThe power rule for antiderivatives is integral x^n dx = x^(n+1)/(n+1) + C, for n not equal to -1. Always include the constant of integration.\n\nPractice\n1. Differentiate 3x^2 + 2x.\n2. Find the antiderivative of 4x^3.\n3. Evaluate a limit by factoring before substituting.'),
    fileName: 'calculus-revision-notes.txt',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-note-2',
    title: 'Study Group: Data Structures',
    description: 'Weekly discussion on arrays, stacks, queues, and graph traversal.',
    university: 'Ardhi University',
    course: 'Computer Science',
    category: 'Study Groups',
    fileUrl: demoFileUrl('Data Structures Study Outline\n\nArrays store indexed items in contiguous order.\nStacks use last-in, first-out ordering.\nQueues use first-in, first-out ordering.\nA linked list stores values in nodes connected by references.\nA tree represents hierarchical relationships; a binary search tree keeps smaller values on the left and larger values on the right.\nA graph represents vertices connected by edges. Breadth-first search explores by distance; depth-first search follows a path before backtracking.'),
    fileName: 'data-structures-study-outline.txt',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
];

const demoProfiles: AdminProfile[] = [
  {
    id: 'demo-admin',
    fullName: 'Amina Hassan',
    email: 'admin@demo.local',
    university: 'University of Dar es Salaam',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-student',
    fullName: 'John Msema',
    email: 'student@demo.local',
    university: 'Ardhi University',
    role: 'student',
    createdAt: new Date(Date.now() - 7_200_000).toISOString(),
  },
];

export type AcademicResource = {
  id: string;
  title: string;
  description: string;
  university: string;
  course: string;
  category: string;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
};

export type AdminProfile = {
  id: string;
  fullName: string;
  email: string;
  university: string;
  role: 'student' | 'admin';
  createdAt: string;
};

type ResourceRow = {
  id: string;
  title: string;
  description: string | null;
  university: string | null;
  course: string | null;
  category: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  university: string;
  role: 'student' | 'admin';
  created_at: string;
};

function mapResource(row: ResourceRow): AcademicResource {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    university: row.university ?? '',
    course: row.course ?? '',
    category: row.category,
    fileUrl: row.file_url,
    fileName: row.file_name,
    createdAt: row.created_at,
  };
}

function mapProfile(row: ProfileRow): AdminProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    university: row.university,
    role: row.role,
    createdAt: row.created_at,
  };
}

function validateFileUrl(value: string) {
  const fileUrl = value.trim();
  if (!fileUrl) return null;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    throw new Error('Weka URL sahihi ya faili.');
  }
  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    throw new Error('Linki ya faili lazima ianze na https:// au http://.');
  }
  return fileUrl;
}

export async function listAcademicResources() {
  if (!isSupabaseConfigured) {
    return demoResources;
  }

  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('notes')
    .select('id,title,description,university,course,category,file_url,file_name,created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as ResourceRow[]).map(mapResource);
}

export async function getAdminDashboardData() {
  if (!isSupabaseConfigured) {
    return {
      profileCount: demoProfiles.length,
      noteCount: demoResources.length,
      profiles: demoProfiles.slice(0, 6),
      notes: demoResources.slice(0, 6),
    };
  }

  requireSupabaseConfig();
  const [profilesCount, notesCount, recentProfiles, recentNotes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('notes').select('id', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id,full_name,email,university,role,created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('notes')
      .select('id,title,description,university,course,category,file_url,file_name,created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  if (profilesCount.error) throw new Error(profilesCount.error.message);
  if (notesCount.error) throw new Error(notesCount.error.message);
  if (recentProfiles.error) throw new Error(recentProfiles.error.message);
  if (recentNotes.error) throw new Error(recentNotes.error.message);

  return {
    profileCount: profilesCount.count ?? 0,
    noteCount: notesCount.count ?? 0,
    profiles: (recentProfiles.data as ProfileRow[]).map(mapProfile),
    notes: (recentNotes.data as ResourceRow[]).map(mapResource),
  };
}

export async function createAcademicResource(input: {
  title: string;
  description: string;
  university: string;
  course: string;
  category: string;
  fileUrl: string;
  fileName: string;
}) {
  if (!isSupabaseConfigured) {
    validateFileUrl(input.fileUrl || '');
    return;
  }

  requireSupabaseConfig();
  const fileUrl = validateFileUrl(input.fileUrl);

  const { error } = await supabase.from('notes').insert({
    title: input.title.trim(),
    description: input.description.trim() || null,
    university: input.university.trim() || null,
    course: input.course.trim() || null,
    category: input.category,
    file_url: fileUrl,
    file_name: input.fileName.trim() || null,
  });

  if (error) throw new Error(error.message);
}

export async function updateAcademicResourceFile(id: string, value: string) {
  if (!isSupabaseConfigured) {
    return;
  }

  requireSupabaseConfig();
  const { error } = await supabase
    .from('notes')
    .update({ file_url: validateFileUrl(value) })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
