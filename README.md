# Construction Tech Platform API

A scalable Node.js API that connects homeowners, contractors, and project managers through job requests, quotes, and milestone-based progress tracking.

<br>

## 🏗️ Architecture Overview

### Entity Relationship Diagram

```
┌──────────────┐     1:N     ┌──────────────┐     N:1     ┌──────────────┐
│     User     ├─────────────►│   Project    ├─────────────┤   Milestone  │
│              │             │              │             │              │
│ - id (UUID)  │             │ - id (UUID)  │             │ - id (UUID)  │
│ - email      │             │ - title      │             │ - title      │
│ - role       │             │ - location   │             │ - status     │
│ - firstName  │             │ - budget     │             │ - order      │
│ - lastName   │             │ - status     │             │ - dates      │
└──────────────┘             └──────────────┘             └──────────────┘
       │                            │
       │ 1:N                        │ 1:N
       │                            │
       ▼                            ▼
┌──────────────┐             ┌──────────────┐
│     Bid      │             │              │
│              │             │              │
│ - id (UUID)  │◄────────────┤              │
│ - price      │             │              │
│ - duration   │             │              │
│ - status     │             │              │
└──────────────┘             └──────────────┘
```

### Core Entities

- **User**: Multi-role entity (homeowner, contractor, project_manager)
- **Project**: Created by homeowners, contains job details and requirements
- **Bid**: Contractor proposals on projects with pricing and timelines
- **Milestone**: Progress tracking with payment milestones

<br>

## 🚀 Quick Start

### Local Development

1. **Clone and Setup**
```bash
git clone <your-repo-url>
cd construction-tech-api
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

3. **Database Setup**
```bash
# Start PostgreSQL (using Docker)
docker run --name postgres-construction \
  -e POSTGRES_DB=construction_tech \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 -d postgres:15-alpine

# Run migrations
npm run migrate
```

4. **Start Development Server**
```bash
npm run dev
# Server runs on http://localhost:3000
```

### Using Docker Compose

```bash
# Start all services (API + PostgreSQL)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

<br>

## 📡 API Endpoints

### Authentication
| Method | Endpoint             | Description              | Auth Required |
| ------ | -------------------- | ------------------------ | ------------- |
| POST   | `/api/auth/register` | Register new user        | No            |
| POST   | `/api/auth/login`    | Login user               | No            |
| GET    | `/api/auth/profile`  | Get current user profile | Yes           |
| PUT    | `/api/auth/profile`  | Update user profile      | Yes           |

### Projects
| Method | Endpoint            | Description                      | Role Access         |
| ------ | ------------------- | -------------------------------- | ------------------- |
| GET    | `/api/projects`     | List projects (filtered by role) | All                 |
| GET    | `/api/projects/:id` | Get project details with bids    | Owner/Contractor/PM |
| POST   | `/api/projects`     | Create new project               | Homeowner           |
| PUT    | `/api/projects/:id` | Update project                   | Owner/PM            |
| DELETE | `/api/projects/:id` | Delete project                   | Owner/PM            |

### Bids
| Method | Endpoint               | Description                | Role Access         |
| ------ | ---------------------- | -------------------------- | ------------------- |
| GET    | `/api/bids`            | List user's bids           | All                 |
| GET    | `/api/bids/:id`        | Get bid details            | Owner/Contractor/PM |
| POST   | `/api/bids`            | Submit bid on project      | Contractor          |
| PUT    | `/api/bids/:id/status` | Accept/Reject/Withdraw bid | Owner/Contractor    |

### Milestones
| Method | Endpoint                             | Description             | Role Access          |
| ------ | ------------------------------------ | ----------------------- | -------------------- |
| GET    | `/api/milestones/project/:projectId` | List project milestones | Project participants |
| GET    | `/api/milestones/:id`                | Get milestone details   | Project participants |
| POST   | `/api/milestones`                    | Create milestone        | Owner/PM             |
| PUT    | `/api/milestones/:id`                | Update milestone        | Owner/Assignee/PM    |
| DELETE | `/api/milestones/:id`                | Delete milestone        | Owner/PM             |

### Users
| Method | Endpoint                 | Description        | Role Access |
| ------ | ------------------------ | ------------------ | ----------- |
| GET    | `/api/users/contractors` | Browse contractors | All         |
| GET    | `/api/users/:id`         | Get user profile   | All         |

<br>

## 🔧 Testing the API

### Sample curl Commands

**1. Register a Homeowner**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "homeowner",
    "phone": "+1234567890",
    "address": "123 Main St, City, State"
  }'
```

**2. Login and Get Token**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**3. Create a Project**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Kitchen Renovation",
    "description": "Complete kitchen remodel including cabinets, countertops, and appliances",
    "location": "San Francisco, CA",
    "category": "renovation",
    "budget": 25000,
    "urgency": "medium"
  }'
```

**4. Register a Contractor**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contractor@example.com",
    "password": "securepassword123",
    "firstName": "Mike",
    "lastName": "Builder",
    "role": "contractor",
    "yearsExperience": 10,
    "specializations": ["kitchen", "renovation", "plumbing"]
  }'
```

**5. Submit a Bid**
```bash
curl -X POST http://localhost:3000/api/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CONTRACTOR_JWT_TOKEN" \
  -d '{
    "projectId": "PROJECT_UUID",
    "price": 23000,
    "estimatedDuration": 30,
    "description": "Complete kitchen renovation with high-quality materials and 2-year warranty",
    "proposedStartDate": "2024-02-01T00:00:00Z",
    "warranty": "2 years on all work and materials"
  }'
```

### Postman Collection

Import the following collection for comprehensive API testing:

```json
{
  "info": {
    "name": "Construction Tech API",
    "description": "Complete API collection for testing all endpoints"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "jwt_token",
      "value": ""
    }
  ]
}
```

<br>

## ☁️ AWS Elastic Beanstalk Deployment

### Prerequisites

1. AWS CLI configured with appropriate permissions
2. EB CLI installed: `pip install awsebcli`
3. Docker installed locally

### Deployment Steps

**1. Initialize Elastic Beanstalk**
```bash
eb init construction-tech-api --region us-east-1 --platform docker
```

**2. Create Environment Variables**
```bash
eb setenv NODE_ENV=production \
  DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/construction_tech \
  JWT_SECRET=your-production-jwt-secret \
  JWT_EXPIRES_IN=7d
```

**3. Deploy Application**
```bash
# Create and deploy to staging
eb create construction-tech-staging --instance-type t3.micro

# Deploy to production
eb create construction-tech-production --instance-type t3.small
```

**4. Configure RDS Database**
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier construction-tech-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username admin \
  --master-user-password YourSecurePassword123 \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx
```

**5. Run Database Migrations**
```bash
# SSH into EB instance
eb ssh
sudo docker exec -it $(sudo docker ps -q) npm run migrate
```

### Environment Configuration Files

The deployment includes:
- `.ebextensions/01-nginx.config` - Nginx proxy configuration
- `.ebextensions/02-environment.config` - Environment settings
- `.ebextensions/03-logs.config` - Log aggregation
- `Dockerrun.aws.json` - Docker platform configuration

### Health Checks

The API includes a health check endpoint at `/health`:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Monitoring and Logs

- **Application Logs**: Available in EB console and CloudWatch
- **Health Monitoring**: Built-in EB health dashboard
- **Error Tracking**: Winston logger with structured JSON output

<br>

## 🛡️ Security Features

### Authentication & Authorization
- JWT-based authentication with configurable expiration
- Role-based access control (RBAC)
- Resource ownership validation
- Password hashing with bcrypt (salt rounds: 12)

### Input Validation & Sanitization
- Express-validator for comprehensive input validation
- SQL injection prevention via Sequelize ORM
- XSS protection through input sanitization
- Rate limiting (100 requests per 15 minutes per IP)

### Security Headers & Middleware
- Helmet.js for security headers
- CORS configuration with origin whitelist
- Request compression for performance
- Error handling without information leakage

### Environment Security
- Environment variable management (.env)
- Secrets management (no hardcoded credentials)
- Non-root Docker user
- Health checks for container monitoring

<br>

## 📊 Database Schema

### Key Relationships
- Users → Projects (1:N) - Homeowner relationship
- Projects → Bids (1:N) - Multiple contractors can bid
- Users → Bids (1:N) - Contractor relationship  
- Projects → Milestones (1:N) - Progress tracking
- Users → Milestones (1:N) - Assignment relationship

### Indexes for Performance
- Users: email, role
- Projects: homeownerId, status, category
- Bids: projectId, contractorId, status
- Milestones: projectId, assignedTo, status

<br>

## 🔄 Development Workflow

### Available Scripts
```bash
npm start          # Production server
npm run dev        # Development with nodemon
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
npm test           # Run test suite
npm run lint       # Code linting
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
```

### Code Organization
```
src/
├── models/         # Sequelize models
├── routes/         # Express route handlers
├── middleware/     # Authentication, validation, error handling
├── utils/          # Logger, helpers
└── server.js       # Application entry point

database/
├── migrations/     # Database schema migrations
├── seeders/        # Sample data seeders
└── config/         # Database configuration

.ebextensions/      # AWS Elastic Beanstalk configuration
```

### Best Practices Implemented
- **Security**: JWT auth, input validation, rate limiting
- **Scalability**: Stateless design, database indexing, pagination
- **Maintainability**: Modular code structure, comprehensive logging
- **Performance**: Database optimization, response compression
- **Reliability**: Error handling, health checks, graceful shutdown

<br>

## 🚦 Production Considerations

### Environment Variables (Production)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=7d
LOG_LEVEL=warn
AWS_REGION=us-east-1
```

### Scaling Recommendations
1. **Database**: Use AWS RDS with read replicas for high traffic
2. **Caching**: Implement Redis for session management and caching
3. **Load Balancing**: Use AWS Application Load Balancer
4. **Monitoring**: CloudWatch metrics and alerts
5. **Backup**: Automated RDS backups and point-in-time recovery

### Security Checklist
- [ ] Environment variables configured securely
- [ ] Database credentials rotated regularly
- [ ] HTTPS enforced in production
- [ ] Rate limiting configured appropriately
- [ ] Error messages don't expose sensitive information
- [ ] Logs don't contain sensitive data
- [ ] Database connections use SSL
- [ ] JWT secrets are cryptographically secure

<br>

## 📈 Future Enhancements

### Potential Features
- Real-time notifications (WebSockets/Socket.io)
- File upload for project images and documents
- Payment integration (Stripe/PayPal)
- Email notifications for bid updates
- Advanced search and filtering
- Mobile app API support
- Chat system between homeowners and contractors
- Review and rating system
- Project timeline visualization

### Technical Improvements
- API versioning
- GraphQL endpoint for complex queries
- Background job processing (Bull/Agenda)
- API documentation with Swagger/OpenAPI
- Integration testing suite
- CI/CD pipeline
- Database query optimization
- Microservices architecture migration

<br>

## 📞 Support & Contributing

### Getting Help
- Check the health endpoint: `GET /health`
- Review application logs in `logs/` directory
- Verify environment variables are set correctly
- Ensure database connectivity

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes with proper tests
4. Submit a pull request with detailed description


<br>

---

**Built with ❤️ using Node.js, Express, PostgreSQL, and AWS**