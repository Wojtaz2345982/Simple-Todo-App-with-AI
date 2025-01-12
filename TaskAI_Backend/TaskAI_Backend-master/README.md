# TaskAI Backend with .NET Aspire

A modern .NET 8 backend application for task and note management with AI assistance capabilities.

## 🚀 Features

- **Todo Management**: Create, read, update, and delete tasks
- **Notes System**: Add and retrieve notes
- **AI Assistant**: Built-in AI assistance using OpenAI integration
- **Authentication**: JWT-based authentication system
- **PostgreSQL Database**: Reliable data storage with Npgsql
- **Swagger Documentation**: API documentation and testing interface

## 🛠 Tech Stack

- **.NET 8**: Latest .NET framework with high performance
- **ASP.NET Core**: Web API framework
- **PostgreSQL**: Database system
- **Dapper**: Lightweight ORM for database operations
- **MediatR**: CQRS and mediator pattern implementation
- **FluentValidation**: Request validation
- **Mapster**: Object mapping
- **OpenAI Integration**: AI assistance capabilities
- **JWT Authentication**: Secure API access
- **Swagger/OpenAPI**: API documentation

## 📦 Project Structure

- **TaskAI**: Main application project containing:
  - `Features/`: Feature-based organization (Todos, Notes, AI Assistant)
  - `Common/`: Shared interfaces and utilities
  - `Infrastructure/`: Database, services, and persistence logic
- **TaskAI.AppHost**: Application host and configuration
- **TaskAI.ServiceDefaults**: Common service configurations and defaults

## 🚦 Getting Started

### Prerequisites

- .NET 8 SDK
- PostgreSQL database
- OpenAI API key (for AI assistant features)

### Configuration

1. Clone the repository
2. Set up your PostgreSQL database
3. Configure your user secrets or environment variables:
   ```json
   {
     "JWTSecretKey" : "JWT Secret for example from Supabase Auth",
     "OPENAI_API_KEY" : "Your OpenAI API key",
     "SupabaseUrl" : "Url to your Supabase project",
     "SupabaseKey" : "Public key to your Supabase project"
   }
   ```

### Running the Application

1. Navigate to the project directory
2. Run the application:
   ```bash
   dotnet run --project TaskAI.AppHost
   ```
3. Access Swagger UI at `https://localhost:[port]/swagger`

## 🔒 Authentication

The API uses JWT Bearer authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer [your-jwt-token]
```

## 📝 API Endpoints

- **Todos**
  - GET `/api/todos`: Get all todos
  - GET `/api/todos/{id}`: Get todo details
  - POST `/api/todos`: Create new todo
  - PUT `/api/todos/{id}/done`: Mark todo as done
  - PUT `/api/todos/{id}/not-done`: Mark todo as not done
  - DELETE `/api/todos/{id}`: Delete todo

- **Notes**
  - GET `/api/notes`: Get all notes
  - POST `/api/notes`: Create new note

- **AI Assistant**
  - POST `/api/assistant/ask`: Get AI assistance

## 🛡 Security

- JWT authentication for API access
- User secrets for sensitive configuration
- CORS policy configured for frontend access

## 📚 Dependencies

- Aspire.Npgsql: `8.2.2`
- Dapper: `2.1.35`
- FluentValidation: `11.11.0`
- Mapster: `7.4.0`
- MediatR: `12.4.1`
- OpenAI: `2.1.0`
- Swashbuckle.AspNetCore: `6.4.0`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
