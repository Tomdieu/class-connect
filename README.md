# ClassConnect 🎓

[![wakatime](https://wakatime.com/badge/github/Tomdieu/class-connect.svg)](https://wakatime.com/badge/github/Tomdieu/class-connect)

> **The first online learning platform in Cameroon** offering personalized courses and adaptive learning at your own pace.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

ClassConnect is a comprehensive e-learning platform designed to revolutionize education in Africa and beyond. The platform provides quality education to students across different educational levels including middle school, high school, university, and professionals seeking to acquire new skills.

### 🎯 Mission
To democratize access to quality education through technology, making learning accessible, affordable, and effective for everyone.

### 🌍 Target Markets
- **Cameroon** (Primary market)
- **Central Africa** (Expansion target)
- **French-speaking Africa** (Long-term vision)

## ✨ Features

### 🎓 **Education Management**
- **Multi-level Support**: College, High School, University, and Professional courses
- **Class Management**: Structured hierarchical class organization
- **Subject & Curriculum**: Comprehensive subject management with chapters and topics
- **Resource Library**: Videos, PDFs, exercises, and revision materials
- **Progress Tracking**: Student progress monitoring and analytics

### 👥 **User Management**
- **Role-based Access**: Students, Professionals, Teachers, and Administrators
- **User Profiles**: Comprehensive user profiles with class enrollment
- **Authentication**: Secure OAuth2 authentication with social login (Google)
- **Multi-language Support**: French and English interface

### 💰 **Subscription & Payments**
- **Flexible Plans**: Basic, Standard, and Premium subscription tiers
- **Mobile Payments**: Integration with MTN Money and Orange Money
- **Secure Processing**: Payment verification and subscription management
- **FreemoPay Integration**: Local payment gateway support

### 🎥 **Live Learning**
- **Video Conferencing**: Integrated Jitsi Meet for live sessions
- **Online Meetings**: Scheduled and on-demand virtual classrooms
- **Real-time Collaboration**: Interactive learning sessions
- **Meeting Management**: Session recording and participant tracking

### 💬 **Communication & Community**
- **Forum System**: Public and private discussion forums
- **Real-time Chat**: WebSocket-powered messaging
- **Notifications**: Push notifications for important updates
- **Social Features**: Student-teacher interaction and peer collaboration

### 🏫 **Course Management**
- **Course Offerings**: Teacher-created course offerings with pricing
- **Enrollment System**: Student-teacher enrollment management
- **Course Declarations**: Formal course registration and payment tracking
- **School Year Management**: Academic year organization

### 📊 **Analytics & Reporting**
- **User Analytics**: Detailed user activity tracking
- **Performance Metrics**: Learning progress and engagement analytics
- **Administrative Dashboard**: Comprehensive admin panel for platform management
- **Activity Logging**: Complete audit trail for all user actions

## 🏗 Architecture

ClassConnect follows a **hybrid architecture** combining both **monolithic** and **microservices** patterns:

### 🔧 **Current Architecture (Monolithic)**
```
Frontend (Next.js) → Backend (Django) → Database (PostgreSQL/SQLite)
                              ↓
                        External Services
                    (Payment Gateways, Email, etc.)
```

### 🔮 **Target Architecture (Microservices)**
```
Frontend (Next.js) → API Gateway → Microservices
                                      ├── User Service
                                      ├── Course Service
                                      ├── Payment Service
                                      ├── Notification Service
                                      └── Streaming Service
```

## 🛠 Technology Stack

### **Frontend**
- **Framework**: Next.js 15 (React 19)
- **TypeScript**: Full type safety
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Authentication**: NextAuth.js v5
- **Internationalization**: next-international
- **Animations**: Framer Motion
- **Real-time**: WebSockets for chat

### **Backend**
- **Framework**: Django 5.1.4 + Django REST Framework
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Authentication**: OAuth2 (django-oauth-toolkit)
- **API Documentation**: Swagger/OpenAPI (drf-yasg)
- **Task Queue**: Celery + Redis
- **WebSockets**: Django Channels
- **File Storage**: Django Storages (S3 compatible)

### **Infrastructure & DevOps**
- **Containerization**: Docker + Docker Compose
- **Caching**: Redis
- **Message Queue**: RabbitMQ
- **Web Server**: Nginx (Production)
- **Process Manager**: Gunicorn
- **Database**: PostgreSQL 14+

### **Third-party Integrations**
- **Video Conferencing**: Jitsi Meet
- **Payment Processing**: CamPay, FreemoPay
- **Cloud Storage**: AWS S3 / Backblaze B2
- **Email Service**: SMTP
- **Push Notifications**: Web Push API
- **Calendar**: Google Calendar API

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **Python** 3.9+
- **PostgreSQL** 14+ (or SQLite for development)
- **Redis** 6+
- **Docker** & Docker Compose (recommended)

### 🐳 Quick Start with Docker

1. **Clone the repository**
```bash
git clone https://github.com/Tomdieu/class-connect.git
cd class-connect
```

2. **Start with Docker Compose**
```bash
# Development environment
docker-compose -f docker-compose.dev.yml up --build

# Production environment
docker-compose -f docker-compose.prod.yml up --build
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

### 🔧 Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend/monolythic
```

2. **Create virtual environment**
```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Run migrations**
```bash
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Create subscription plans**
```bash
python manage.py create_subscription_plans
```

8. **Start development server**
```bash
python manage.py runserver
```

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Start development server**
```bash
npm run dev
# or
yarn dev
```

## 📁 Project Structure

```
class-connect/
├── 📁 frontend/                 # Next.js React application
│   ├── 📁 src/
│   │   ├── 📁 app/             # App router pages
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 actions/         # Server actions
│   │   ├── 📁 contexts/        # React contexts
│   │   ├── 📁 hooks/          # Custom hooks
│   │   ├── 📁 lib/            # Utility libraries
│   │   ├── 📁 services/       # API services
│   │   ├── 📁 store/          # State management
│   │   ├── 📁 types/          # TypeScript types
│   │   └── 📁 locales/        # Internationalization
│   ├── 📁 public/             # Static assets
│   └── 📄 package.json
│
├── 📁 backend/
│   ├── 📁 monolythic/         # Main Django application
│   │   ├── 📁 backend/        # Django project settings
│   │   ├── 📁 users/          # User management app
│   │   ├── 📁 courses/        # Course management app
│   │   ├── 📁 payments/       # Payment processing app
│   │   ├── 📁 notifications/  # Notification system app
│   │   ├── 📁 forum/          # Forum and chat app
│   │   ├── 📁 streamings/     # Video conferencing app
│   │   └── 📁 utils/          # Shared utilities
│   │
│   └── 📁 micro-services/     # Future microservices
│       ├── 📁 user-service/
│       ├── 📁 course-service/
│       ├── 📁 payment-service/
│       ├── 📁 notification-service/
│       └── 📁 streaming-service/
│
├── 📁 design/                 # Design assets
├── 📄 docker-compose.yml     # Docker configuration
├── 📄 README.md              # This file
└── 📄 cheats.md              # Development cheat sheet
```

## 📚 API Documentation

### 🔗 **Main Endpoints**

| Service | Endpoint | Description |
|---------|----------|-------------|
| **Authentication** | `/api/auth/` | OAuth2 authentication |
| **Users** | `/api/users/` | User management |
| **Courses** | `/api/courses/` | Course and class management |
| **Payments** | `/api/payments/` | Subscription and payments |
| **Forum** | `/api/forum/` | Discussion forums |
| **Streaming** | `/api/streaming/` | Video conferences |
| **Notifications** | `/api/notifications/` | Push notifications |

### 📖 **Interactive Documentation**
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/

### 🔑 **Authentication**
The API uses OAuth2 Bearer token authentication:

```javascript
// Example API request
const response = await fetch('/api/courses/', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

## 🌐 Deployment

### 🐳 **Docker Deployment**

1. **Build production images**
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Deploy with environment variables**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### ☁️ **Cloud Deployment**

#### **Frontend (Vercel/Netlify)**
```bash
# Build command
npm run build

# Output directory
.next
```

#### **Backend (VPS/Cloud)**
```bash
# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic

# Run with Gunicorn
gunicorn backend.wsgi:application
```

### 🔧 **Environment Variables**

#### **Frontend (.env.local)**
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### **Backend (.env)**
```env
DEBUG=False
SECRET_KEY=your-django-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/classconnect
REDIS_URL=redis://localhost:6379/0
EMAIL_HOST=smtp.example.com
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-password
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 **Bug Reports**
- Use the issue tracker to report bugs
- Include detailed reproduction steps
- Provide environment information

### 💡 **Feature Requests**
- Describe the feature and its benefits
- Provide use cases and examples
- Discuss implementation approaches

### 🔄 **Pull Requests**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### 📝 **Development Guidelines**
- Follow the existing code style
- Write clear commit messages
- Add documentation for new features
- Ensure tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Tomdieu Ivan**
- 🌍 Location: Cameroon
- 📧 Email: ivan.tomdieu@gmail.com
- 💼 Role: Full Stack Developer & Founder
- 🎯 Vision: Democratizing education through technology

### 🛠 **Technical Expertise**
- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **Backend**: Python, Django, REST APIs, PostgreSQL
- **DevOps**: Docker, Cloud Infrastructure, CI/CD
- **Mobile**: React Native, Progressive Web Apps

## 🙏 Acknowledgments

- **Students and Educators** in Cameroon for inspiring this project
- **Open Source Community** for the amazing tools and libraries
- **Contributors** who help make ClassConnect better
- **Payment Partners** for enabling financial inclusion

## 🔮 Roadmap

### **Phase 1: Core Platform** ✅
- ✅ User management and authentication
- ✅ Course and class structure
- ✅ Payment integration
- ✅ Basic forum system

### **Phase 2: Enhanced Learning** 🚧
- 🚧 Video conferencing integration
- 🚧 Advanced analytics
- 🚧 Mobile optimization
- 🚧 Offline content access

### **Phase 3: Scale & Expand** 📋
- 📋 Microservices migration
- 📋 Multi-tenant architecture
- 📋 AI-powered recommendations
- 📋 Mobile applications

### **Phase 4: Innovation** 🌟
- 🌟 VR/AR learning experiences
- 🌟 Blockchain certificates
- 🌟 AI tutoring assistants
- 🌟 Advanced analytics dashboard

---

<p align="center">
  <strong>Building the future of education in Africa, one student at a time. 🌍✨</strong>
</p>

<p align="center">
  <a href="https://classconnect.cm">🌐 Visit ClassConnect</a> •
  <a href="mailto:ivan.tomdieu@gmail.com">📧 Contact Us</a> •
  <a href="#contributing">🤝 Contribute</a>
</p>
