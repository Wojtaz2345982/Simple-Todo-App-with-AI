using Dapper;
using Npgsql;

namespace TaskAI.Infrastructure.Perstistence;

public class DatabaseInitializer(
    NpgsqlDataSource dataSource,
    IConfiguration configuration,
    ILogger<DatabaseInitializer> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await CreateDatabaseIfNotExist(stoppingToken);
            await InitializeSchema(stoppingToken);

            logger.LogInformation("Database schema initialized successfully.");
        }
        catch (Exception)
        {
            logger.LogError("Failed to initialize database schema.");

            throw;
        }
    }

    private async Task CreateDatabaseIfNotExist(CancellationToken stoppingToken)
    {
        var connectionString = configuration.GetConnectionString("tasksdb");
        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        string? databaseName = builder.Database;
        builder.Database = "postgres";

        await using var connection = new NpgsqlConnection(builder.ToString());
        await connection.OpenAsync(stoppingToken);

        bool databaseExists = await connection.ExecuteScalarAsync<bool>(
            "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = @databaseName)",
            new { databaseName });

        if (!databaseExists)
        {
            logger.LogInformation("Creating database '{DatabaseName}'...", databaseName);
            await connection.ExecuteAsync($"CREATE DATABASE \"{databaseName}\"");
        }

    }

    private async Task InitializeSchema(CancellationToken stoppingToken)
    {
        const string createTableSql =
            """
            CREATE TABLE IF NOT EXISTS tasks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                priority INT,
                deadline TIMESTAMPTZ,
                done BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS notes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                content TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
            CREATE INDEX IF NOT EXISTS idx_notes_task_id ON notes(task_id);
            """;

        await using var connection = await dataSource.OpenConnectionAsync(stoppingToken);

        await using var command = dataSource.CreateCommand(createTableSql);

        await command.ExecuteNonQueryAsync(stoppingToken);

    }
}
