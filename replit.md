# Sistema Financeiro Locador

## Overview

This is a comprehensive financial management web application for the "Locador" system, built as a full-stack solution with FastAPI backend and React frontend. The system provides complete financial operations management including accounts payable/receivable, financial transactions, categories, and real-time dashboard analytics. It integrates with an existing SQL Server database and maintains compatibility with the current authentication system using SHA-256 password hashing and JWT tokens.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: FastAPI with Python 3.10+ for REST API development
- **Database**: SQL Server integration using SQLAlchemy ORM with existing schema compatibility
- **Authentication**: JWT token-based authentication integrating with existing `tbl_Funcionarios` table
- **Password Security**: SHA-256 hashing compatible with current C# system, includes master password support
- **API Design**: RESTful endpoints with automatic OpenAPI/Swagger documentation
- **Data Validation**: Pydantic schemas for request/response validation and serialization
- **Database Migrations**: Alembic for schema version control
- **Audit Trail**: Comprehensive user tracking with `LoginAuditMixin` and `UserAuditMixin` for all operations

### Frontend Architecture
- **Framework**: React 18+ with TypeScript for type safety and modern development
- **UI Library**: Material-UI (MUI) v6+ for consistent, professional component design
- **State Management**: Redux Toolkit for global application state with React Query for server state
- **Routing**: React Router v6 with authentication guards and protected routes
- **Forms**: React Hook Form with Yup validation for robust form handling
- **Localization**: Complete Portuguese (pt-BR) localization using react-i18next
- **Charts**: Chart.js and Recharts for financial data visualization
- **HTTP Client**: Axios with interceptors for API communication and error handling

### Database Design
- **Primary Database**: SQL Server with existing schema integration
- **Models**: 13 comprehensive financial models including audit mixins
- **Relationships**: Proper foreign key relationships between entities
- **Audit Fields**: All tables include user audit trails (`IdUserCreate`, `IdUserAlter`, timestamps)
- **Data Integrity**: Constraints and validations at both database and application levels

### Security Implementation
- **Authentication Flow**: JWT tokens with configurable expiration (24 hours default)
- **Authorization**: Role-based access control through employee status validation
- **Password Compatibility**: MD5 + Base64 hashing matching existing C# system
- **CORS Configuration**: Properly configured for development and production environments
- **Input Validation**: Comprehensive validation using Pydantic schemas
- **Audit Logging**: Complete user action tracking for compliance

### Financial Modules
- **Transactions (Lançamentos)**: Complete CRUD with confirmation workflow and bulk operations
- **Categories**: Hierarchical category system with validation and status management  
- **Accounts Payable**: Supplier payment management with installments and automated calculations
- **Accounts Receivable**: Customer receivables with overdue tracking and payment processing
- **Companies**: Multi-company support with default company configuration
- **Banks**: Bank management with FEBRABAN code validation
- **Bank Accounts**: Account management with PIX integration and API banking support
- **Clients**: Customer management supporting both individual and corporate entities
- **Dashboard**: Real-time financial KPIs, cash flow analysis, and reporting

## External Dependencies

### Backend Dependencies
- **FastAPI**: Web framework for building APIs with automatic documentation
- **SQLAlchemy**: ORM for database operations and relationship management
- **Pydantic**: Data validation and serialization library
- **PyODBC**: SQL Server database connectivity driver
- **PyJWT**: JWT token generation and validation
- **Passlib**: Password hashing utilities with bcrypt support
- **Alembic**: Database migration management tool
- **Uvicorn**: ASGI server for running FastAPI applications
- **Python-Jose**: Cryptographic operations for JWT handling

### Frontend Dependencies
- **React**: Core UI library with hooks and modern patterns
- **Material-UI**: Comprehensive component library with theming support
- **Redux Toolkit**: State management with simplified Redux patterns
- **React Query**: Server state management with caching and synchronization
- **React Router**: Client-side routing with nested routes and guards
- **React Hook Form**: Form management with performance optimization
- **Axios**: HTTP client with request/response interceptors
- **Chart.js**: Data visualization library for financial charts
- **date-fns**: Date manipulation and formatting library
- **i18next**: Internationalization framework for Portuguese localization

### Development Tools
- **Docker**: Containerization for consistent development and deployment environments
- **pytest**: Python testing framework with async support
- **Jest**: JavaScript testing framework for frontend unit tests
- **React Testing Library**: Testing utilities for React components
- **TypeScript**: Static type checking for enhanced code quality
- **ESLint**: Code linting for consistent code style
- **Prettier**: Code formatting tool

### Database Integration
- **SQL Server**: Primary database system with existing schema compatibility
- **ODBC Driver 17**: Latest SQL Server connectivity driver
- **Connection Pooling**: Optimized database connection management
- **Transaction Management**: ACID compliance for financial operations