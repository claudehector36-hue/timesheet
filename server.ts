import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import { generateTimesheetExcel } from './src/server/exportExcel.js';
import { User, Client, Mission, TimeEntry, TimesheetPeriod, AssignedTask } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_PATH = path.join(__dirname, 'src', 'data', 'db.json');

// Interface for DB file
interface DatabaseSchema {
  users: User[];
  clients: Client[];
  missions: Mission[];
  timeEntries: TimeEntry[];
  timesheetPeriods: TimesheetPeriod[];
  tasks?: AssignedTask[];
}

// In-memory token store for active sessions
const activeSessions = new Map<string, { userId: string; role: string; createdAt: number }>();

// Read database
function readDb(): DatabaseSchema {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return { users: [], clients: [], missions: [], timeEntries: [], timesheetPeriods: [] };
  }
}

// Write database
function writeDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing db.json:', error);
  }
}

// Ensure initial users have hashed passwords
function ensureDefaultPasswordHashes(): void {
  const db = readDb();
  let updated = false;

  const defaultAdminHash = bcrypt.hashSync('Admin123!', 10);
  const defaultUserHash = bcrypt.hashSync('User123!', 10);

  db.users.forEach(u => {
    if (!u.passwordHash || !u.passwordHash.startsWith('$2b$')) {
      u.passwordHash = (u.role === 'ADMIN') ? defaultAdminHash : defaultUserHash;
      updated = true;
    }
  });

  if (updated) {
    writeDb(db);
    console.log('Updated db.json with valid bcrypt default password hashes.');
  }
}

// Sanitize user object (never leak passwordHash)
function sanitizeUser(user: User): Omit<User, 'passwordHash' | 'password'> {
  const copy = { ...user };
  delete copy.passwordHash;
  delete copy.password;
  return copy;
}

// Extract authenticated user from request
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  // Check active session or token pattern gst_<userId>_<timestamp>_<random>
  let userId: string | undefined;
  const session = activeSessions.get(token);
  if (session) {
    userId = session.userId;
  } else if (token.startsWith('gst_')) {
    const parts = token.split('_');
    if (parts.length >= 2) {
      userId = parts[1];
    }
  }

  if (!userId) return null;

  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user || user.status === 'INACTIVE') return null;

  return user;
}

async function startServer() {
  ensureDefaultPasswordHashes();

  const app = express();

  app.use(express.json());

  // Authorization Middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Accès non autorisé. Veuillez vous connecter.' });
    }
    (req as any).user = user;
    next();
  };

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès réservé aux Administrateurs.' });
    }
    (req as any).user = user;
    next();
  };

  const requireAdminOrManager = (req: Request, res: Response, next: NextFunction) => {
    const user = getAuthUser(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès réservé aux Administrateurs.' });
    }
    (req as any).user = user;
    next();
  };

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth: Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Veuillez saisir votre email et votre mot de passe.' });
    }

    const db = readDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({ error: 'Ce compte est désactivé. Veuillez contacter votre administrateur.' });
    }

    const passwordMatches = user.passwordHash && bcrypt.compareSync(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const token = `gst_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    activeSessions.set(token, { userId: user.id, role: user.role, createdAt: Date.now() });

    return res.json({
      user: sanitizeUser(user),
      token
    });
  });

  // Auth: Current User
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Session expirée ou invalide. Veuillez vous reconnecter.' });
    }
    return res.json(sanitizeUser(user));
  });

  // Auth: Forgot Password Request
  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Adresse email requise.' });
    }

    const db = readDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    // Security practice: return identical response regardless of whether email exists
    return res.json({
      success: true,
      message: user 
        ? `Si un compte est associé à l'adresse ${email}, une demande de réinitialisation a été enregistrée pour l'administrateur.`
        : `Si un compte est associé à cette adresse email, des instructions ont été transmises.`
    });
  });

  // -------------------------------------------------------------
  // USERS CRUD
  // -------------------------------------------------------------
  app.get('/api/users', requireAuth, (req: Request, res: Response) => {
    const db = readDb();
    const sanitized = db.users.map(u => sanitizeUser(u));
    res.json(sanitized);
  });

  app.post('/api/users', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const { firstName, lastName, email, role, department, dailyRate, weeklyCapacity, status, password } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Champs obligatoires manquants (Prénom, Nom, Email).' });
    }

    // Check duplicate email
    if (db.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return res.status(400).json({ error: 'Un utilisateur existe déjà avec cette adresse email.' });
    }

    const rawPassword = password && password.trim().length >= 4 ? password.trim() : (role === 'ADMIN' ? 'Admin123!' : 'User123!');
    const hashedPassword = bcrypt.hashSync(rawPassword, 10);

    const newUser: User = {
      id: `usr-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      role: role || 'USER',
      department: department || 'Consulting',
      dailyRate: Number(dailyRate) || 500,
      weeklyCapacity: Number(weeklyCapacity) || 35,
      status: status || 'ACTIVE',
      passwordHash: hashedPassword
    };

    db.users.push(newUser);
    writeDb(db);
    res.status(201).json(sanitizeUser(newUser));
  });

  app.put('/api/users/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const index = db.users.findIndex(u => u.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const currentUserData = db.users[index];
    const { password, ...otherFields } = req.body;

    let updatedHash = currentUserData.passwordHash;
    if (password && typeof password === 'string' && password.trim().length > 0) {
      updatedHash = bcrypt.hashSync(password.trim(), 10);
    }

    const updatedUser: User = {
      ...currentUserData,
      ...otherFields,
      passwordHash: updatedHash
    };

    db.users[index] = updatedUser;
    writeDb(db);
    res.json(sanitizeUser(updatedUser));
  });

  app.delete('/api/users/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const force = req.query.force === 'true';
    const db = readDb();

    const userToDelete = db.users.find(u => u.id === id);
    if (!userToDelete) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Prevent deleting self
    const reqUser = (req as any).user as User;
    if (reqUser && reqUser.id === id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte administrateur connecté.' });
    }

    // Check relations
    const hasTimeEntries = db.timeEntries.some(te => te.userId === id);
    const isAssignedToMissions = db.missions.some(m => m.assignedUserIds.includes(id));

    if ((hasTimeEntries || isAssignedToMissions) && !force) {
      // Recommend deactivation to preserve integrity
      return res.status(200).json({
        actionRequired: 'DEACTIVATE_RECOMMENDED',
        message: `L'utilisateur ${userToDelete.firstName} ${userToDelete.lastName} possède des saisies de temps ou des affectations de mission. Il est recommandé de désactiver son compte pour conserver l'historique.`
      });
    }

    db.users = db.users.filter(u => u.id !== id);
    writeDb(db);
    res.json({ success: true, message: `Utilisateur ${userToDelete.firstName} ${userToDelete.lastName} supprimé avec succès.` });
  });

  // -------------------------------------------------------------
  // CLIENTS CRUD
  // -------------------------------------------------------------
  app.get('/api/clients', requireAuth, (req: Request, res: Response) => {
    const db = readDb();
    res.json(db.clients);
  });

  app.post('/api/clients', requireAdminOrManager, (req: Request, res: Response) => {
    const db = readDb();
    const newClient: Client = {
      id: `cli-${Date.now()}`,
      code: req.body.code?.toUpperCase() || `CLI${Math.floor(Math.random() * 900 + 100)}`,
      name: req.body.name,
      contactName: req.body.contactName || '',
      contactEmail: req.body.contactEmail || '',
      contactPhone: req.body.contactPhone || '',
      status: req.body.status || 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };

    db.clients.push(newClient);
    writeDb(db);
    res.status(201).json(newClient);
  });

  app.put('/api/clients/:id', requireAdminOrManager, (req: Request, res: Response) => {
    const db = readDb();
    const index = db.clients.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    db.clients[index] = {
      ...db.clients[index],
      ...req.body
    };

    writeDb(db);
    res.json(db.clients[index]);
  });

  // -------------------------------------------------------------
  // MISSIONS CRUD
  // -------------------------------------------------------------
  app.get('/api/missions', requireAuth, (req: Request, res: Response) => {
    const db = readDb();
    res.json(db.missions);
  });

  app.post('/api/missions', requireAdminOrManager, (req: Request, res: Response) => {
    const db = readDb();

    const client = db.clients.find(c => c.id === req.body.clientId);
    const clientName = client ? client.name : req.body.clientName || 'Client Inconnu';

    const newMission: Mission = {
      id: `mis-${Date.now()}`,
      code: req.body.code || `MIS-${Math.floor(Math.random() * 900 + 100)}`,
      name: req.body.name,
      clientId: req.body.clientId,
      clientName,
      type: req.body.type || 'FORFAIT',
      startDate: req.body.startDate || new Date().toISOString().split('T')[0],
      endDate: req.body.endDate || '2026-12-31',
      budgetHours: Number(req.body.budgetHours) || 100,
      budgetAmount: Number(req.body.budgetAmount) || 8000,
      hourlyRate: Number(req.body.hourlyRate) || 80,
      status: req.body.status || 'IN_PROGRESS',
      assignedUserIds: Array.isArray(req.body.assignedUserIds) ? req.body.assignedUserIds : []
    };

    db.missions.push(newMission);
    writeDb(db);
    res.status(201).json(newMission);
  });

  app.put('/api/missions/:id', requireAdminOrManager, (req: Request, res: Response) => {
    const db = readDb();
    const index = db.missions.findIndex(m => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    db.missions[index] = {
      ...db.missions[index],
      ...req.body
    };

    writeDb(db);
    res.json(db.missions[index]);
  });

  // -------------------------------------------------------------
  // TIME ENTRIES CRUD
  // -------------------------------------------------------------
  app.get('/api/time-entries', requireAuth, (req: Request, res: Response) => {
    const db = readDb();
    const reqUser = (req as any).user as User;

    let userId = req.query.userId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const status = req.query.status as string;
    const taskStatus = req.query.taskStatus as string;

    // Security: Standard USER can ONLY view their own entries
    if (reqUser.role === 'USER') {
      userId = reqUser.id;
    }

    let entries = db.timeEntries;

    if (userId) {
      entries = entries.filter(e => e.userId === userId);
    }
    if (startDate) {
      entries = entries.filter(e => e.date >= startDate);
    }
    if (endDate) {
      entries = entries.filter(e => e.date <= endDate);
    }
    if (status) {
      entries = entries.filter(e => e.status === status);
    }
    if (taskStatus && taskStatus !== 'Tous') {
      entries = entries.filter(e => (e.taskStatus || 'Terminé') === taskStatus);
    }

    res.json(entries);
  });

  app.post('/api/time-entries', requireAuth, (req: Request, res: Response) => {
    const db = readDb();
    const reqUser = (req as any).user as User;

    // Non-admin can only create entry for self
    const targetUserId = reqUser.role === 'USER' ? reqUser.id : (req.body.userId || reqUser.id);
    const user = db.users.find(u => u.id === targetUserId) || reqUser;
    const mission = db.missions.find(m => m.id === req.body.missionId);
    const client = db.clients.find(c => c.id === (req.body.clientId || mission?.clientId));

    const validTaskStatuses = ['En attente', 'En cours', 'Terminé'];
    const rawTaskStatus = req.body.taskStatus;
    const taskStatus = validTaskStatuses.includes(rawTaskStatus) ? rawTaskStatus : 'En cours';

    const newEntry: TimeEntry = {
      id: `te-${Date.now()}`,
      userId: targetUserId,
      userName: `${user.firstName} ${user.lastName}`,
      clientId: client ? client.id : req.body.clientId || '',
      clientName: req.body.clientName || (client ? client.name : 'Client Inconnu'),
      missionId: req.body.missionId || '',
      missionName: req.body.missionName || (mission ? mission.name : 'Mission Inconnue'),
      activity: req.body.activity || 'Tâche Générale',
      date: req.body.date,
      hours: Number(req.body.hours) || 0,
      description: req.body.description || '',
      taskStatus,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.timeEntries.push(newEntry);
    writeDb(db);
    res.status(201).json(newEntry);
  });

  // -------------------------------------------------------------
  // ASSIGNED TASKS ENDPOINTS
  // -------------------------------------------------------------
  app.get('/api/tasks', requireAuth, (req: Request, res: Response) => {
    const db = readDb();
    const reqUser = (req as any).user as User;
    const tasks = db.tasks || [];

    if (reqUser.role === 'USER') {
      return res.json(tasks.filter(t => t.assignedToUserId === reqUser.id));
    }

    const assignedToUserId = req.query.assignedToUserId as string;
    if (assignedToUserId) {
      return res.json(tasks.filter(t => t.assignedToUserId === assignedToUserId));
    }

    res.json(tasks);
  });

  app.post('/api/tasks', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const adminUser = (req as any).user as User;
    const { assignedToUserId, clientName, missionName, activity, description, dueDate, estimatedHours } = req.body;

    const assignedUser = db.users.find(u => u.id === assignedToUserId);
    if (!assignedUser) {
      return res.status(400).json({ error: 'Utilisateur destinataire introuvable.' });
    }

    if (!db.tasks) db.tasks = [];

    const newTask: AssignedTask = {
      id: `tsk-${Date.now()}`,
      assignedToUserId,
      assignedToUserName: `${assignedUser.firstName} ${assignedUser.lastName}`,
      assignedByUserId: adminUser.id,
      clientName: clientName || 'Client Interne',
      missionName: missionName || 'Mission Tâche',
      activity: activity || 'Tâche Attribuée',
      description: description || '',
      dueDate: dueDate || '',
      estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    db.tasks.push(newTask);
    writeDb(db);
    res.status(201).json(newTask);
  });

  app.patch('/api/tasks/:id', requireAuth, (req: Request, res: Response) => {
    const db = readDb();
    const reqUser = (req as any).user as User;
    if (!db.tasks) db.tasks = [];

    const index = db.tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Tâche introuvable.' });
    }

    const existing = db.tasks[index];
    if (reqUser.role === 'USER' && existing.assignedToUserId !== reqUser.id) {
      return res.status(403).json({ error: 'Accès interdit.' });
    }

    db.tasks[index] = {
      ...existing,
      ...req.body
    };

    writeDb(db);
    res.json(db.tasks[index]);
  });

  app.delete('/api/tasks/:id', requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    if (!db.tasks) db.tasks = [];

    db.tasks = db.tasks.filter(t => t.id !== req.params.id);
    writeDb(db);
    res.json({ success: true });
  });

  app.put('/api/time-entries/:id', requireAuth, (req: Request, res: Response) => {
    const db = readDb();
    const reqUser = (req as any).user as User;
    const index = db.timeEntries.findIndex(e => e.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Saisie non trouvée' });
    }

    const existingEntry = db.timeEntries[index];

    // Standard user can only edit their own entries
    if (reqUser.role === 'USER' && existingEntry.userId !== reqUser.id) {
      return res.status(403).json({ error: 'Vous ne pouvez pas modifier la saisie d\'un autre collaborateur.' });
    }

    db.timeEntries[index] = {
      ...existingEntry,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    writeDb(db);
    res.json(db.timeEntries[index]);
  });

  app.delete('/api/time-entries/:id', requireAuth, (req: Request, res: Response) => {
    const db = readDb();
    const reqUser = (req as any).user as User;
    const entry = db.timeEntries.find(e => e.id === req.params.id);

    if (!entry) {
      return res.status(404).json({ error: 'Saisie non trouvée' });
    }

    if (reqUser.role === 'USER' && entry.userId !== reqUser.id) {
      return res.status(403).json({ error: 'Vous ne pouvez pas supprimer la saisie d\'un autre collaborateur.' });
    }

    db.timeEntries = db.timeEntries.filter(e => e.id !== req.params.id);
    writeDb(db);
    res.json({ success: true });
  });

  // -------------------------------------------------------------
  // EXPORT EXCEL (.XLSX)
  // -------------------------------------------------------------
  app.get('/api/export/excel', requireAuth, async (req: Request, res: Response) => {
    try {
      const reqUser = (req as any).user as User;
      let targetUserId = req.query.userId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const db = readDb();

      // Standard user can ONLY export their own data!
      if (reqUser.role === 'USER') {
        targetUserId = reqUser.id;
      }

      let targetUser = db.users.find(u => u.id === targetUserId);
      if (!targetUser) {
        targetUser = reqUser;
      }

      // Filter entries
      let filteredEntries = db.timeEntries;
      if (targetUserId) {
        filteredEntries = filteredEntries.filter(e => e.userId === targetUserId);
      }

      if (startDate) {
        filteredEntries = filteredEntries.filter(e => e.date >= startDate);
      }
      if (endDate) {
        filteredEntries = filteredEntries.filter(e => e.date <= endDate);
      }

      const periodLabel = startDate && endDate ? `Du ${startDate} au ${endDate}` : 'Toutes périodes';

      const excelBuffer = await generateTimesheetExcel({
        user: targetUser,
        timeEntries: filteredEntries,
        missions: db.missions,
        clients: db.clients,
        periodLabel,
        startDate,
        endDate,
        isFullExport: targetUser.role === 'ADMIN'
      });

      const filename = `Timesheet_${targetUser.lastName}_${Date.now()}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(excelBuffer);

    } catch (error) {
      console.error('Error generating Excel export:', error);
      return res.status(500).json({ error: "Erreur lors de la génération du fichier Excel" });
    }
  });

  // -------------------------------------------------------------
  // VITE & STATIC FILES
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GestiaTimesheet Server running on http://localhost:${PORT}`);
  });
}

startServer();
