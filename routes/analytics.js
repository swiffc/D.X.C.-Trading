const { supabase } = require('../config/supabase');

async function analyticsRoutes(fastify, options) {
  // Authentication middleware
  const authenticate = async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  };

  // Get trading statistics
  fastify.get('/api/analytics/stats', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { period = '30d' } = request.query;
      
      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get all trades for the period
      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', request.user.userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      // Calculate statistics
      const totalTrades = trades.length;
      const closedTrades = trades.filter(t => t.status === 'closed');
      const openTrades = trades.filter(t => t.status === 'open');
      
      const winningTrades = closedTrades.filter(t => t.pnl > 0);
      const losingTrades = closedTrades.filter(t => t.pnl < 0);
      
      const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
      
      const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      const totalRisk = closedTrades.reduce((sum, trade) => sum + (trade.risk_amount || 0), 0);
      const totalReturn = totalRisk > 0 ? (totalPnL / totalRisk) * 100 : 0;
      
      const avgWin = winningTrades.length > 0 ? 
        winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length : 0;
      
      const avgLoss = losingTrades.length > 0 ? 
        Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0) / losingTrades.length) : 0;
      
      const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
      
      // Strategy breakdown
      const strategyStats = {};
      closedTrades.forEach(trade => {
        if (!strategyStats[trade.strategy]) {
          strategyStats[trade.strategy] = {
            trades: 0,
            wins: 0,
            losses: 0,
            pnl: 0
          };
        }
        strategyStats[trade.strategy].trades++;
        strategyStats[trade.strategy].pnl += trade.pnl || 0;
        if (trade.pnl > 0) {
          strategyStats[trade.strategy].wins++;
        } else if (trade.pnl < 0) {
          strategyStats[trade.strategy].losses++;
        }
      });

      // Session breakdown
      const sessionStats = {};
      closedTrades.forEach(trade => {
        if (!sessionStats[trade.session]) {
          sessionStats[trade.session] = {
            trades: 0,
            wins: 0,
            losses: 0,
            pnl: 0
          };
        }
        sessionStats[trade.session].trades++;
        sessionStats[trade.session].pnl += trade.pnl || 0;
        if (trade.pnl > 0) {
          sessionStats[trade.session].wins++;
        } else if (trade.pnl < 0) {
          sessionStats[trade.session].losses++;
        }
      });

      const stats = {
        period,
        totalTrades,
        openTrades: openTrades.length,
        closedTrades: closedTrades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate: Math.round(winRate * 100) / 100,
        totalPnL: Math.round(totalPnL * 100) / 100,
        totalReturn: Math.round(totalReturn * 100) / 100,
        avgWin: Math.round(avgWin * 100) / 100,
        avgLoss: Math.round(avgLoss * 100) / 100,
        profitFactor: Math.round(profitFactor * 100) / 100,
        strategyStats,
        sessionStats
      };

      return { stats };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Get P&L chart data
  fastify.get('/api/analytics/pnl-chart', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { period = '30d' } = request.query;
      
      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get closed trades for the period
      const { data: trades, error } = await supabase
        .from('trades')
        .select('exit_time, pnl')
        .eq('user_id', request.user.userId)
        .eq('status', 'closed')
        .gte('exit_time', startDate.toISOString())
        .order('exit_time', { ascending: true });

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      // Calculate cumulative P&L
      let cumulativePnL = 0;
      const chartData = trades.map(trade => {
        cumulativePnL += trade.pnl || 0;
        return {
          date: trade.exit_time,
          pnl: trade.pnl || 0,
          cumulativePnL: Math.round(cumulativePnL * 100) / 100
        };
      });

      return { chartData };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Get recent trades
  fastify.get('/api/analytics/recent-trades', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { limit = 10 } = request.query;

      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', request.user.userId)
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return { trades };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  // Get BTMM specific analytics
  fastify.get('/api/analytics/btmm', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { period = '30d' } = request.query;
      
      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get trades for BTMM analysis
      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', request.user.userId)
        .eq('status', 'closed')
        .gte('created_at', startDate.toISOString());

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      // Market structure analysis
      const marketStructureStats = {};
      trades.forEach(trade => {
        if (!marketStructureStats[trade.market_structure]) {
          marketStructureStats[trade.market_structure] = {
            trades: 0,
            wins: 0,
            pnl: 0
          };
        }
        marketStructureStats[trade.market_structure].trades++;
        marketStructureStats[trade.market_structure].pnl += trade.pnl || 0;
        if (trade.pnl > 0) {
          marketStructureStats[trade.market_structure].wins++;
        }
      });

      // Risk-Reward analysis
      const rrRanges = {
        'Below 1:1': { count: 0, wins: 0, pnl: 0 },
        '1:1 to 1:2': { count: 0, wins: 0, pnl: 0 },
        '1:2 to 1:3': { count: 0, wins: 0, pnl: 0 },
        'Above 1:3': { count: 0, wins: 0, pnl: 0 }
      };

      trades.forEach(trade => {
        const rr = trade.risk_reward_ratio || 0;
        let range;
        
        if (rr < 1) range = 'Below 1:1';
        else if (rr < 2) range = '1:1 to 1:2';
        else if (rr < 3) range = '1:2 to 1:3';
        else range = 'Above 1:3';

        rrRanges[range].count++;
        rrRanges[range].pnl += trade.pnl || 0;
        if (trade.pnl > 0) {
          rrRanges[range].wins++;
        }
      });

      const btmmAnalytics = {
        period,
        marketStructureStats,
        riskRewardAnalysis: rrRanges,
        totalTrades: trades.length
      };

      return { btmmAnalytics };
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = analyticsRoutes;
