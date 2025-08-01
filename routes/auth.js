const bcrypt = require('bcryptjs');
const { supabase, supabaseAdmin } = require('../config/supabase');

async function authRoutes(fastify, options) {
  // Google OAuth login/register
  fastify.post('/api/auth/google', async (request, reply) => {
    try {
      const { token } = request.body;

      // Verify Google token and get user info
      const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token
      });

      if (authError) {
        return reply.code(400).send({ error: authError.message });
      }

      // Check if user profile exists, create if not
      let { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // User doesn't exist, create profile
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: authData.user.email,
              first_name: authData.user.user_metadata?.full_name?.split(' ')[0] || '',
              last_name: authData.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
              avatar_url: authData.user.user_metadata?.avatar_url || '',
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (createError) {
          return reply.code(400).send({ error: createError.message });
        }
        profileData = newProfile;
      } else if (profileError) {
        return reply.code(400).send({ error: profileError.message });
      }

      // Generate JWT token
      const jwtToken = fastify.jwt.sign({ 
        userId: authData.user.id, 
        email: authData.user.email 
      });

      return { 
        user: profileData, 
        token: jwtToken,
        message: 'Google authentication successful' 
      };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Register user
  fastify.post('/api/auth/register', async (request, reply) => {
    try {
      const { email, password, firstName, lastName } = request.body;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (authError) {
        return reply.code(400).send({ error: authError.message });
      }

      // Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (profileError) {
        return reply.code(400).send({ error: profileError.message });
      }

      // Generate JWT token
      const token = fastify.jwt.sign({ 
        userId: authData.user.id, 
        email: authData.user.email 
      });

      return { 
        user: profileData, 
        token,
        message: 'User registered successfully' 
      };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Login user
  fastify.post('/api/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body;

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        return reply.code(400).send({ error: profileError.message });
      }

      // Generate JWT token
      const token = fastify.jwt.sign({ 
        userId: authData.user.id, 
        email: authData.user.email 
      });

      return { 
        user: profileData, 
        token,
        message: 'Login successful' 
      };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Get current user
  fastify.get('/api/auth/me', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  }, async (request, reply) => {
    try {
      const { data: profileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', request.user.userId)
        .single();

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return { user: profileData };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = authRoutes;
