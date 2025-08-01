# BTMM Trading Journal

A comprehensive trading journal application inspired by TradZella, specifically designed for BTMM (Break the Market Maker) Steve Maruo trading methods.

## Features

### 🎯 Core Trading Features
- **Trade Management**: Create, track, and manage your trades with detailed entry/exit information
- **BTMM Strategy Support**: Built-in support for Steve Maruo's trading methodologies
- **Screenshot Manager**: Upload and organize trade screenshots with automatic categorization
- **Advanced Analytics**: Comprehensive performance tracking and analysis

### 📊 Analytics & Reporting
- **Performance Metrics**: Win rate, profit factor, total P&L, and more
- **Strategy Analysis**: Track performance by trading strategy
- **Session Performance**: Analyze performance by trading sessions (London, New York, Asian, Overlap)
- **Risk-Reward Analysis**: Monitor your risk-reward ratios and their effectiveness
- **Market Structure Analysis**: Track performance in different market conditions

### 🔐 Security & Authentication
- **User Authentication**: Secure login/registration with JWT tokens
- **Row-Level Security**: Data isolation using Supabase RLS policies
- **Secure File Storage**: Screenshots stored securely in Supabase Storage

## Tech Stack

### Backend
- **Node.js** with **Fastify** framework
- **Supabase** for database and authentication
- **JWT** for session management
- **Multer** for file uploads

### Frontend
- **Vanilla JavaScript** with modern ES6+ features
- **Tailwind CSS** for responsive design
- **Font Awesome** for icons
- **Progressive Web App** ready

### Database
- **PostgreSQL** (via Supabase)
- **Row-Level Security** (RLS) policies
- **Automated backups** and scaling

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Trading-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy the provided `.env` file with your Supabase credentials
   - Update the `DATABASE_URL` password if needed

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the SQL script from `database/schema.sql`

5. **Start the application**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open your browser and go to `http://localhost:5000`

## Database Setup

The application requires several tables to be created in your Supabase database. Run the SQL script in `database/schema.sql` to create:

- `users` - User profiles
- `trades` - Trading records
- `screenshots` - Screenshot metadata
- `journal_entries` - Trading journal entries
- `btmm_setups` - BTMM-specific setup data

The script also creates:
- Indexes for performance optimization
- Row-Level Security policies
- Storage bucket for screenshots
- Automated timestamp triggers

## Usage

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Add your first trade** using the "New Trade" tab
3. **Upload screenshots** to document your setups and results
4. **Analyze your performance** in the Analytics tab

### Adding Trades
Fill in the trade details including:
- Symbol (e.g., EURUSD, GBPUSD)
- Direction (Long/Short)
- Entry/Exit prices
- Stop loss and take profit levels
- Position size and risk amount
- BTMM strategy used
- Market structure assessment
- Trading session
- Entry reasoning and notes

### Screenshot Management
- Upload trade screenshots with automatic categorization
- Link screenshots to specific trades
- Organize by type: Entry, Exit, Analysis, Setup, Other
- Add descriptions for better organization

### Analytics Dashboard
Monitor your trading performance with:
- Overall statistics (win rate, profit factor, total P&L)
- Strategy-specific performance metrics
- Session-based analysis
- Market structure performance
- Risk-reward ratio effectiveness

## BTMM Trading Methods Supported

The application is specifically designed to support Steve Maruo's BTMM methodology:

### Strategy Types
- **Liquidity Grab**: Track liquidity hunting setups
- **Order Block**: Monitor institutional order block plays
- **Fair Value Gap**: Document FVG trading opportunities
- **Break of Structure**: Record BOS confirmations
- **Change of Character**: Track CHOCH patterns
- **Inducement**: Document inducement setups

### Market Structure Analysis
- **Bullish**: Uptrending market conditions
- **Bearish**: Downtrending market conditions
- **Ranging**: Sideways market movement

### Session Tracking
- **London Session**: European market hours
- **New York Session**: US market hours
- **Asian Session**: Asian market hours
- **Overlap**: Session overlap periods

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Trades
- `GET /api/trades` - Get user's trades
- `POST /api/trades` - Create new trade
- `GET /api/trades/:id` - Get specific trade
- `PUT /api/trades/:id` - Update trade
- `POST /api/trades/:id/close` - Close trade
- `DELETE /api/trades/:id` - Delete trade

### Screenshots
- `POST /api/screenshots/upload` - Upload screenshot
- `GET /api/screenshots` - Get user's screenshots
- `GET /api/screenshots/:id` - Get specific screenshot
- `PUT /api/screenshots/:id` - Update screenshot metadata
- `DELETE /api/screenshots/:id` - Delete screenshot

### Analytics
- `GET /api/analytics/stats` - Get trading statistics
- `GET /api/analytics/pnl-chart` - Get P&L chart data
- `GET /api/analytics/btmm` - Get BTMM-specific analytics

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Environment Variables
Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - Secret for JWT token signing
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions about BTMM trading methods, refer to Steve Maruo's educational content and community resources.

## Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced charting integration
- [ ] Automated trade importing from brokers
- [ ] AI-powered trade analysis
- [ ] Social trading features
- [ ] Advanced backtesting tools
- [ ] Custom strategy builder
- [ ] Risk management alerts
- [ ] Performance benchmarking
- [ ] Export/import functionality

---

**Happy Trading! 📈**
