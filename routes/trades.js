const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

async function tradesRoutes(fastify, options) {
  // Authentication middleware
  const authenticate = async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  };

  // Create new trade
  fastify.post('/api/trades', { preHandler: authenticate }, async (request, reply) => {
    try {
      const {
        symbol,
        direction, // 'long' or 'short'
        entry_price,
        stop_loss,
        take_profit,
        position_size,
        risk_amount,
        strategy, // BTMM specific strategies
        market_structure, // 'bullish', 'bearish', 'ranging'
        entry_reason,
        notes,
        session // 'london', 'new_york', 'asian', 'overlap'
      } = request.body;

      const trade = {
        id: uuidv4(),
        user_id: request.user.userId,
        symbol,
        direction,
        entry_price: parseFloat(entry_price),
        stop_loss: parseFloat(stop_loss),
        take_profit: parseFloat(take_profit),
        position_size: parseFloat(position_size),
        risk_amount: parseFloat(risk_amount),
        strategy,
        market_structure,
        entry_reason,
        notes,
        session,
        status: 'open',
        entry_time: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      // Calculate risk-reward ratio
      const riskPoints = Math.abs(trade.entry_price - trade.stop_loss);
      const rewardPoints = Math.abs(trade.take_profit - trade.entry_price);
      trade.risk_reward_ratio = rewardPoints / riskPoints;

      const { data, error } = await supabase
        .from('trades')
        .insert([trade])
        .select()
        .single();

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return { trade: data, message: 'Trade created successfully' };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Get all trades for user
  fastify.get('/api/trades', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { status, symbol, strategy, limit = 50, offset = 0 } = request.query;
      
      let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', request.user.userId)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (symbol) query = query.eq('symbol', symbol);
      if (strategy) query = query.eq('strategy', strategy);

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return { trades: data };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Get single trade
  fastify.get('/api/trades/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', request.params.id)
        .eq('user_id', request.user.userId)
        .single();

      if (error) {
        return reply.code(404).send({ error: 'Trade not found' });
      }

      return { trade: data };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Update trade
  fastify.put('/api/trades/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const updates = { ...request.body };
      updates.updated_at = new Date().toISOString();

      // Recalculate risk-reward if prices changed
      if (updates.entry_price || updates.stop_loss || updates.take_profit) {
        const { data: currentTrade } = await supabase
          .from('trades')
          .select('entry_price, stop_loss, take_profit')
          .eq('id', request.params.id)
          .single();

        const entry = parseFloat(updates.entry_price || currentTrade.entry_price);
        const stopLoss = parseFloat(updates.stop_loss || currentTrade.stop_loss);
        const takeProfit = parseFloat(updates.take_profit || currentTrade.take_profit);

        const riskPoints = Math.abs(entry - stopLoss);
        const rewardPoints = Math.abs(takeProfit - entry);
        updates.risk_reward_ratio = rewardPoints / riskPoints;
      }

      const { data, error } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', request.params.id)
        .eq('user_id', request.user.userId)
        .select()
        .single();

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return { trade: data, message: 'Trade updated successfully' };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Close trade
  fastify.post('/api/trades/:id/close', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { exit_price, exit_reason, notes } = request.body;

      const updates = {
        status: 'closed',
        exit_price: parseFloat(exit_price),
        exit_reason,
        exit_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (notes) updates.notes = notes;

      // Get current trade to calculate P&L
      const { data: currentTrade } = await supabase
        .from('trades')
        .select('*')
        .eq('id', request.params.id)
        .eq('user_id', request.user.userId)
        .single();

      if (!currentTrade) {
        return reply.code(404).send({ error: 'Trade not found' });
      }

      // Calculate P&L
      const direction = currentTrade.direction;
      const entryPrice = currentTrade.entry_price;
      const exitPrice = parseFloat(exit_price);
      const positionSize = currentTrade.position_size;

      let pnl;
      if (direction === 'long') {
        pnl = (exitPrice - entryPrice) * positionSize;
      } else {
        pnl = (entryPrice - exitPrice) * positionSize;
      }

      updates.pnl = pnl;
      updates.pnl_percentage = (pnl / currentTrade.risk_amount) * 100;

      const { data, error } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', request.params.id)
        .eq('user_id', request.user.userId)
        .select()
        .single();

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return { trade: data, message: 'Trade closed successfully' };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Delete trade
  fastify.delete('/api/trades/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', request.params.id)
        .eq('user_id', request.user.userId);

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return { message: 'Trade deleted successfully' };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = tradesRoutes;
