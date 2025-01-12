using Dapper;
using Mapster;
using MediatR;
using TaskAI.Common.Interfaces;
using TaskAI.Common.ResultTypes;
using TaskAI.Domain.Todos;
using TaskAI.Infrastructure.Services;

namespace TaskAI.Features.Todos;

public class GetTodosEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/todos", async (ISender sender) =>
        {
            var result = await sender.Send(new GetTodos.GetTodosQuery());

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(result.Error.Message);
        })
        .RequireAuthorization()
        .WithTags("Todos");

    }
}

public static class GetTodos
{
    public record GetTodosQuery : IRequest<Result<IEnumerable<GetTodosResponse>>>;

    public record GetTodosResponse(Guid Id, string Title, string Description, DateTime? Deadline, PriorityLevel PriorityLevel, bool Done);

    internal sealed class Handler(
        SqlConnectionFactory sqlConnectionFactory,
        ILogger<Handler> logger,
        ICurrentUserService userContextService) : IRequestHandler<GetTodosQuery, Result<IEnumerable<GetTodosResponse>>>
    {
        public async Task<Result<IEnumerable<GetTodosResponse>>> Handle(GetTodosQuery request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(userContextService.UserId!);

            var connection = sqlConnectionFactory.Create();

            var sql = """
                    SELECT id, title, description, deadline, priority AS PriorityLevel, done
                    FROM tasks              
                    WHERE user_id = @userId
                """;

            var todos = await connection.QueryAsync<TodoItem>(sql, new { userId });

            var todosResponse = todos.Adapt<IEnumerable<GetTodosResponse>>();

            return Result.Success(todosResponse);
        }
    }

}
