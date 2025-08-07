const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

async function screenshotsRoutes(fastify, options) {
  // Upload screenshot
  fastify.post('/api/screenshots/upload', async (request, reply) => {
    try {
      const data = await request.file();
      
      if (!data) {
        return reply.code(400).send({ error: 'No file uploaded' });
      }

      const { trade_id, screenshot_type, description } = data.fields;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.code(400).send({ error: 'Invalid file type. Only images are allowed.' });
      }

      // Generate unique filename
      const fileExtension = path.extname(data.filename);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = `screenshots/default-user/${fileName}`;

      // Convert buffer to base64 for Supabase storage
      const buffer = await data.toBuffer();
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('trade-screenshots')
        .upload(filePath, buffer, {
          contentType: data.mimetype,
          upsert: false
        });

      if (uploadError) {
        return reply.code(400).send({ error: uploadError.message });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('trade-screenshots')
        .getPublicUrl(filePath);

      // Save screenshot metadata to database
      const screenshot = {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        trade_id: trade_id?.value || null,
        filename: data.filename,
        file_path: filePath,
        file_url: urlData.publicUrl,
        file_size: buffer.length,
        mime_type: data.mimetype,
        screenshot_type: screenshot_type?.value || 'entry',
        description: description?.value || '',
        created_at: new Date().toISOString()
      };

      const { data: dbData, error: dbError } = await supabase
        .from('screenshots')
        .insert([screenshot])
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('trade-screenshots').remove([filePath]);
        return reply.code(400).send({ error: dbError.message });
      }

      return { 
        screenshot: dbData, 
        message: 'Screenshot uploaded successfully' 
      };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Get screenshots for user
  fastify.get('/api/screenshots', async (request, reply) => {
    try {
      const { trade_id, screenshot_type, limit = 50, offset = 0 } = request.query;
      
      let query = supabase
        .from('screenshots')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000001')
        .order('created_at', { ascending: false });

      if (trade_id) query = query.eq('trade_id', trade_id);
      if (screenshot_type) query = query.eq('screenshot_type', screenshot_type);

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return { screenshots: data };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Get single screenshot
  fastify.get('/api/screenshots/:id', async (request, reply) => {
    try {
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('id', request.params.id)
        .eq('user_id', '00000000-0000-0000-0000-000000000001')
        .single();

      if (error) {
        return reply.code(404).send({ error: 'Screenshot not found' });
      }

      return { screenshot: data };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Update screenshot metadata
  fastify.put('/api/screenshots/:id', async (request, reply) => {
    try {
      const { description, screenshot_type, trade_id } = request.body;
      
      const updates = {
        updated_at: new Date().toISOString()
      };

      if (description !== undefined) updates.description = description;
      if (screenshot_type !== undefined) updates.screenshot_type = screenshot_type;
      if (trade_id !== undefined) updates.trade_id = trade_id;

      const { data, error } = await supabase
        .from('screenshots')
        .update(updates)
        .eq('id', request.params.id)
        .eq('user_id', '00000000-0000-0000-0000-000000000001')
        .select()
        .single();

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return { screenshot: data, message: 'Screenshot updated successfully' };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Delete screenshot
  fastify.delete('/api/screenshots/:id', async (request, reply) => {
    try {
      // Get screenshot data first
      const { data: screenshot, error: fetchError } = await supabase
        .from('screenshots')
        .select('file_path')
        .eq('id', request.params.id)
        .eq('user_id', '00000000-0000-0000-0000-000000000001')
        .single();

      if (fetchError) {
        return reply.code(404).send({ error: 'Screenshot not found' });
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('trade-screenshots')
        .remove([screenshot.file_path]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError.message);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('screenshots')
        .delete()
        .eq('id', request.params.id)
        .eq('user_id', '00000000-0000-0000-0000-000000000001');

      if (dbError) {
        return reply.code(400).send({ error: dbError.message });
      }

      return { message: 'Screenshot deleted successfully' };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Get screenshots for specific trade
  fastify.get('/api/trades/:trade_id/screenshots', async (request, reply) => {
    try {
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('trade_id', request.params.trade_id)
        .eq('user_id', '00000000-0000-0000-0000-000000000001')
        .order('created_at', { ascending: false });

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return { screenshots: data };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = screenshotsRoutes;
