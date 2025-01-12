using Npgsql;

namespace TaskAI.Infrastructure.Services;

public class SqlConnectionFactory(string ConnectionString)
{
    public NpgsqlConnection Create()
    {
        return new NpgsqlConnection(ConnectionString);

    }
}
