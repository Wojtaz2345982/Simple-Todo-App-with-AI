using Dapper;
using MediatR;
using TaskAI.Common.Interfaces;
using TaskAI.Common.ResultTypes;
using TaskAI.Infrastructure.Services;

namespace TaskAI.Features.Todos;

public class DeleteTodoEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/todos/{id:guid}", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new DeleteTodo.DeleteTodoCommand(id));

            return result.IsSuccess
                ? Results.NoContent()
                : Results.BadRequest(result.Error.Message);
        })
        .RequireAuthorization()
        .WithTags("Todos");
    }
}

public static class DeleteTodo
{
    public record DeleteTodoCommand(Guid Id) : IRequest<Result>;

    internal sealed class Handler(
        SqlConnectionFactory sqlConnectionFactory,
        ILogger<Handler> logger,
        ICurrentUserService userContextService) : IRequestHandler<DeleteTodoCommand, Result>
    {
        public async Task<Result> Handle(DeleteTodoCommand request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(userContextService.UserId!);

            using var connection = sqlConnectionFactory.Create();

            var sql = """
                    DELETE FROM tasks
                    WHERE id = @Id AND user_id = @UserId
                """;

            var affectedRows = await connection.ExecuteAsync(sql, new { request.Id, UserId = userId });

            if (affectedRows == 0)
            {
                return Result.Failure(Error.PermissionDenied("Todo not found or you do not have permission to delete this todo."));
            }

            logger.LogInformation("Todo with id {TaskId} by user {UserId} has been deleted.", request.Id, userId);

            return Result.Success();
        }
    }
}
