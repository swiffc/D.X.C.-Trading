const { supabase, supabaseAdmin } = require('../config/supabase');
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
      
      // Upload to Supabase Storage using admin client for no-auth
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('trading-screenshots')
        .upload(filePath, buffer, {
          contentType: data.mimetype,
          upsert: false
        });

      if (uploadError) {
        return reply.code(400).send({ error: uploadError.message });
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('trading-screenshots')
        .getPublicUrl(filePath);

      // Save screenshot metadata to database (matching your schema)
      const screenshot = {
        filename: fileName,
        original_name: data.filename,
        file_path: filePath,
        public_url: urlData.publicUrl,
        pattern_type: screenshot_type?.value || 'entry',
        title: description?.value || data.filename,
        study_notes: description?.value || '',
        setup_type: screenshot_type?.value || 'entry',
        trade_id: trade_id?.value ? parseInt(trade_id.value) : null,
        file_size: buffer.length,
        mime_type: data.mimetype
      };

      const { data: dbData, error: dbError } = await supabase
        .from('screenshots')
        .insert([screenshot])
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabaseAdmin.storage.from('trading-screenshots').remove([filePath]);
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

  // Get screenshots
  fastify.get('/api/screenshots', async (request, reply) => {
    try {
      const { trade_id, pattern_type, limit = 50, offset = 0 } = request.query;
      
      let query = supabase
        .from('screenshots')
        .select('*')
        .order('created_at', { ascending: false });

      if (trade_id) query = query.eq('trade_id', trade_id);
      if (pattern_type) query = query.eq('pattern_type', pattern_type);

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
      const { study_notes, pattern_type, trade_id, title } = request.body;
      
      const updates = {
        updated_at: new Date().toISOString()
      };

      if (study_notes !== undefined) updates.study_notes = study_notes;
      if (pattern_type !== undefined) updates.pattern_type = pattern_type;
      if (trade_id !== undefined) updates.trade_id = trade_id;
      if (title !== undefined) updates.title = title;

      const { data, error } = await supabase
        .from('screenshots')
        .update(updates)
        .eq('id', request.params.id)
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
        .single();

      if (fetchError) {
        return reply.code(404).send({ error: 'Screenshot not found' });
      }

      // Delete from storage
      const { error: storageError } = await supabaseAdmin.storage
        .from('trading-screenshots')
        .remove([screenshot.file_path]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError.message);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('screenshots')
        .delete()
        .eq('id', request.params.id);

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
