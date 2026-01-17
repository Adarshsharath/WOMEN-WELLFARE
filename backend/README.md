# SafeSpace Backend

Python Flask backend for the SafeSpace women's safety platform.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
copy .env.example .env
# Edit .env with your API keys
```

4. Run the application:
```bash
python app.py
```

The server will start on http://localhost:5000

## Default Admin Credentials

- **Email**: admin@safespace.com
- **Password**: admin123

**⚠️ Change these credentials in production!**

## API Endpoints

### Authentication
- `POST /api/auth/register/woman` - Register woman user
- `POST /api/auth/register/community` - Register community user (requires secret code)
- `POST /api/auth/login` - Login

### Women Routes
- `GET/POST /api/women/emergency-contacts` - Manage emergency contacts
- `POST /api/women/sos` - Trigger SOS
- `POST /api/women/sos/<id>/location` - Update SOS location
- `PUT /api/women/sos/<id>/cancel` - Cancel SOS
- `POST /api/women/safe-routes` - Calculate safe routes
- `POST /api/women/fake-call` - Log fake call

### Police Routes
- `GET /api/police/sos-feed` - Get active SOS events
- `POST /api/police/flag-zone` - Flag high-risk zone
- `GET/POST /api/police/chat` - Police chat
- `POST /api/police/issue` - Report issue to infrastructure

### Infrastructure Routes
- `GET /api/infrastructure/issues` - Get all issues
- `PUT /api/infrastructure/issue/<id>/accept` - Accept issue
- `PUT /api/infrastructure/issue/<id>/complete` - Complete issue

### Cybersecurity Routes
- `GET /api/cybersecurity/monitoring` - Get abuse monitoring data
- `POST /api/cybersecurity/flag-user` - Flag user for admin

### Emergency Routes
- `GET /api/emergency/sos-events` - Get all SOS events
- `GET/POST /api/emergency/broadcast` - Broadcast messages

### Admin Routes
- `GET /api/admin/pending-approvals` - Get pending community registrations
- `PUT /api/admin/approve/<id>` - Approve user
- `PUT /api/admin/suspend/<id>` - Suspend user
- `GET /api/admin/flagged-users` - Get flagged users

### Chatbot Routes
- `POST /api/chatbot/message` - Chat with AI
- `POST /api/chatbot/summarize` - Summarize incident

### Real-time
- `GET /api/sse/sos-updates` - SSE stream for SOS updates

## Secret Codes

For community registration:
- **Police**: POL-AUTH$01
- **Infrastructure**: INFRA-CTRL$02
- **Cybersecurity**: CYB-AUTH$03
- **Emergency**: EMRG-CTRL$04
