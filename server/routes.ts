import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import { storage } from "./storage";
import { insertUserSchema, insertCalendarEventSchema, insertPhotoSchema, insertMoodSchema, insertWorkStatusSchema, insertLoveNoteSchema } from "@shared/schema";
import { z } from "zod";

// Authorized email addresses
const AUTHORIZED_EMAILS = [
  process.env.PARTNER1_EMAIL || "partner1@example.com",
  process.env.PARTNER2_EMAIL || "partner2@example.com"
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuration
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      
      if (!email || !AUTHORIZED_EMAILS.includes(email)) {
        return done(new Error('Unauthorized email address'), undefined);
      }

      let user = await storage.getUserByGoogleId(profile.id);
      
      if (!user) {
        user = await storage.createUser({
          email,
          name: profile.displayName || '',
          avatar: profile.photos?.[0]?.value || '',
          googleId: profile.id
        });

        // Check if we need to create a couple
        const otherUser = await storage.getUserByEmail(
          AUTHORIZED_EMAILS.find(e => e !== email)!
        );
        
        if (otherUser) {
          const existingCouple = await storage.getCoupleByUserId(user.id);
          if (!existingCouple) {
            await storage.createCouple({
              partner1Id: user.id,
              partner2Id: otherUser.id,
              relationshipStart: new Date()
            });
          }
        }
      }

      return done(null, user);
    } catch (error) {
      console.error('OAuth verification error:', error);
      // Return a more specific error for database connection issues
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('fetch failed')) {
        return done(new Error('Database connection failed. Please try again.'), undefined);
      }
      return done(error as Error, undefined);
    }
  }));

  }

  passport.serializeUser((user: any, done) => {
    if (user) {
      done(null, user.id);
    } else {
      done(new Error('No user to serialize'), null);
    }
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, undefined);
    }
  });

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Authentication required' });
  };

  // Setup status endpoint
  app.get('/api/setup/status', (req, res) => {
    const status = {
      database: !!process.env.DATABASE_URL,
      googleAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      emails: !!(process.env.PARTNER1_EMAIL && process.env.PARTNER2_EMAIL),
    };
    res.json(status);
  });

  // Auth routes
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get('/api/auth/google', passport.authenticate('google', {
      scope: ['profile', 'email']
    }));

    app.get('/api/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login' }),
      async (req, res) => {
        try {
          res.redirect('/');
        } catch (error) {
          console.error('OAuth callback error:', error);
          res.redirect('/login?error=oauth_failed');
        }
      }
    );
  } else {
    app.get('/api/auth/google', (req, res) => {
      res.status(503).json({ message: 'Google OAuth not configured' });
    });

    app.get('/api/auth/google/callback', (req, res) => {
      res.redirect('/setup');
    });
  }



  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/user', requireAuth, (req, res) => {
    res.json(req.user);
  });

  // User routes
  app.get('/api/users/me', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const couple = await storage.getCoupleByUserId(user.id);
      res.json({ user, couple });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user data' });
    }
  });

  // Couple routes
  app.get('/api/couples/me', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const couple = await storage.getCoupleByUserId(user.id);
      if (!couple) {
        return res.json(null); // Return null instead of 404 for first-time users
      }
      
      const coupleWithUsers = await storage.getCoupleWithUsers(couple.id);
      res.json(coupleWithUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch couple data' });
    }
  });

  app.post('/api/couples', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const existingCouple = await storage.getCoupleByUserId(user.id);
      if (existingCouple) {
        return res.status(400).json({ message: 'Couple already exists' });
      }

      // Find the other authorized user
      const otherEmail = AUTHORIZED_EMAILS.find(email => email !== user.email);
      if (!otherEmail) {
        return res.status(400).json({ message: 'No partner email configured' });
      }

      const otherUser = await storage.getUserByEmail(otherEmail);
      if (!otherUser) {
        return res.status(400).json({ message: 'Partner has not signed up yet' });
      }

      const coupleData = {
        partner1Id: user.id,
        partner2Id: otherUser.id,
        relationshipStart: new Date(req.body.relationshipStart || new Date())
      };

      const couple = await storage.createCouple(coupleData);
      const coupleWithUsers = await storage.getCoupleWithUsers(couple.id);
      res.json(coupleWithUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create couple' });
    }
  });

  // Calendar routes
  app.get('/api/calendar/events', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const couple = await storage.getCoupleByUserId(user.id);
      if (!couple) {
        return res.json([]); // Return empty array for users without couples
      }
      
      const events = await storage.getCalendarEvents(couple.id);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch calendar events' });
    }
  });

  app.post('/api/calendar/events', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      let couple = await storage.getCoupleByUserId(user.id);
      
      if (!couple) {
        // Try to auto-create couple if partner exists
        const otherEmail = AUTHORIZED_EMAILS.find(email => email !== user.email);
        if (otherEmail) {
          const otherUser = await storage.getUserByEmail(otherEmail);
          if (otherUser) {
            couple = await storage.createCouple({
              partner1Id: user.id,
              partner2Id: otherUser.id,
              relationshipStart: new Date()
            });
          }
        }
        
        if (!couple) {
          return res.status(400).json({ message: 'Partner must sign up first to create events' });
        }
      }

      const eventData = insertCalendarEventSchema.parse({
        ...req.body,
        coupleId: couple.id,
        createdBy: user.id
      });

      const event = await storage.createCalendarEvent(eventData);
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid event data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create calendar event' });
      }
    }
  });

  // Photos routes
  app.get('/api/photos', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const couple = await storage.getCoupleByUserId(user.id);
      if (!couple) {
        return res.json([]); // Return empty array for users without couples
      }
      
      const photos = await storage.getPhotos(couple.id);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch photos' });
    }
  });

  app.post('/api/photos', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const couple = await storage.getCoupleByUserId(user.id);
      if (!couple) {
        return res.status(404).json({ message: 'Couple not found' });
      }

      const photoData = insertPhotoSchema.parse({
        ...req.body,
        coupleId: couple.id,
        uploadedBy: user.id
      });

      const photo = await storage.createPhoto(photoData);
      res.json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid photo data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create photo' });
      }
    }
  });

  // Mood routes
  app.get('/api/moods/today', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const mood = await storage.getUserMood(user.id, new Date());
      res.json(mood || null);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch mood' });
    }
  });

  app.get('/api/moods/partner/today', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const couple = await storage.getCoupleByUserId(user.id);
      if (!couple) {
        return res.json(null);
      }
      
      const partnerId = couple.partner1Id === user.id ? couple.partner2Id : couple.partner1Id;
      const mood = await storage.getUserMood(partnerId, new Date());
      res.json(mood || null);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch partner mood' });
    }
  });

  app.post('/api/moods', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const moodData = insertMoodSchema.parse({
        ...req.body,
        userId: user.id,
        date: new Date()
      });

      // Check if mood already exists for today
      const existingMood = await storage.getUserMood(user.id, new Date());
      
      let mood;
      if (existingMood) {
        mood = await storage.updateMood(existingMood.id, moodData);
      } else {
        mood = await storage.createMood(moodData);
      }
      
      res.json(mood);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid mood data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update mood' });
      }
    }
  });

  // Work status routes
  app.get('/api/work-status/me', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const status = await storage.getUserWorkStatus(user.id);
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch work status' });
    }
  });

  app.post('/api/work-status', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const statusData = insertWorkStatusSchema.parse({
        ...req.body,
        userId: user.id
      });

      const status = await storage.updateWorkStatus(user.id, statusData);
      res.json(status);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid work status data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update work status' });
      }
    }
  });

  // Love notes routes
  app.get('/api/love-notes', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const couple = await storage.getCoupleByUserId(user.id);
      if (!couple) {
        return res.status(404).json({ message: 'Couple not found' });
      }
      
      const notes = await storage.getLoveNotes(couple.id);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch love notes' });
    }
  });

  app.post('/api/love-notes', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const couple = await storage.getCoupleByUserId(user.id);
      if (!couple) {
        return res.status(404).json({ message: 'Couple not found' });
      }

      const partnerId = couple.partner1Id === user.id ? couple.partner2Id : couple.partner1Id;
      
      const noteData = insertLoveNoteSchema.parse({
        ...req.body,
        coupleId: couple.id,
        fromUserId: user.id,
        toUserId: partnerId
      });

      const note = await storage.createLoveNote(noteData);
      res.json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid love note data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create love note' });
      }
    }
  });

  // Stats routes
  app.get('/api/stats', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const couple = await storage.getCoupleByUserId(user.id);
      if (!couple) {
        return res.json({ daysTogether: 0, memoriesShared: 0, datesPlanned: 0, loveNotes: 0 }); // Return default stats
      }
      
      const stats = await storage.getCoupleStats(couple.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
