# SafeSpace - Women's Safety Platform

A comprehensive women's safety platform with real-time emergency response, community coordination, and AI support.

## Features

- **Women Users**: SOS emergency alerts, safe route calculation, fake call feature, AI emotional support
- **Police**: Real-time SOS monitoring, high-risk zone flagging, inter-agency communication
- **Infrastructure**: Issue management and resolution
- **Cybersecurity**: Abuse pattern monitoring and user flagging
- **Emergency Response**: SOS event monitoring and broadcast messaging
- **Admin**: Community member approval and user moderation

## Tech Stack

**Backend:**
- Flask (Python)
- SQLite with SQLAlchemy ORM
- JWT Authentication
- Server-Sent Events (SSE)
- Fast2SMS, WhatsApp API, Gemini AI

**Frontend:**
- React with Vite
- React Router
- React Leaflet (OpenStreetMap)
- Framer Motion
- Pure CSS

## Installation

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your API keys

# Run backend
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## Default Credentials

**Admin Account:**
- Email: `admin@safespace.com`
- Password: `admin123`

**⚠️ IMPORTANT:** Change these credentials in production!

## Community Registration Secret Codes

- **Police**: `POL-AUTH$01`
- **Infrastructure**: `INFRA-CTRL$02`
- **Cybersecurity**: `CYB-AUTH$03`
- **Emergency**: `EMRG-CTRL$04`

## API Configuration

You need to configure the following API keys in `backend/.env`:

1. **Fast2SMS** - Get API key from https://www.fast2sms.com/
2. **WhatsApp Business API** - Set up at https://business.whatsapp.com/
3. **Google Gemini API** - Get key from https://makersuite.google.com/app/apikey

## Project Structure

```
safespace/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── models.py              # Database models
│   ├── auth.py                # JWT authentication
│   ├── sse.py                 # Server-Sent Events
│   ├── routes/                # API route blueprints
│   ├── services/              # External service integrations
│   └── data/                  # CSV data files
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   ├── index.css          # Global styles
│   │   ├── context/           # Auth context
│   │   ├── utils/             # API utilities
│   │   ├── pages/             # Page components
│   │   └── components/        # Shared components
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Usage

1. **Women Registration**: Register directly without approval
2. **Community Registration**: Requires secret code and admin approval
3. **Admin Approval**: Login as admin to approve community members
4. **SOS Flow**: Women must add emergency contacts before triggering SOS
5. **Real-time Updates**: Police and Emergency dashboards receive live SOS updates

## Key Features Explained

### SOS System
- 3-second countdown before activation
- GPS location tracking every 5 seconds
- SMS and WhatsApp alerts to emergency contacts
- Live streaming to police/emergency dashboards
- Battery percentage monitoring

### Safe Routes
- Calculates 3 route types: Fastest, Safest, Most Populated
- Uses crime density, street lighting, and population data
- Considers police-flagged high-risk zones
- Visual map with color-coded routes

### Abuse Monitoring
- Tracks SOS and fake call usage
- Cybersecurity flags abnormal patterns
- Admin reviews and can suspend accounts

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
