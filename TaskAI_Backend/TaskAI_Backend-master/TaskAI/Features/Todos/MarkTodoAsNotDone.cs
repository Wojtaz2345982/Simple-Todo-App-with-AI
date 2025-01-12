using Dapper;
using MediatR;
using TaskAI.Common.Interfaces;
using TaskAI.Common.ResultTypes;
using TaskAI.Infrastructure.Services;

namespace TaskAI.Features.Todos;


public class MarkTodoAsNotDoneEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/todos/{id:guid}/notdone", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new MarkTodoAsNotDone.MarkTodoAsNotDoneCommand(id));

            return result.IsSuccess
                ? Results.NoContent()
                : Results.BadRequest(result.Error.Message);
        })
        .RequireAuthorization()
        .WithTags("Todos");
    }
}

public static class MarkTodoAsNotDone
{
    public record MarkTodoAsNotDoneCommand(Guid Id) : IRequest<Result>;

    internal sealed class Handler(
        SqlConnectionFactory sqlConnectionFactory,
        ILogger<Handler> logger,
        ICurrentUserService userContextService) : IRequestHandler<MarkTodoAsNotDoneCommand, Result>
    {
        public async Task<Result> Handle(MarkTodoAsNotDoneCommand request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(userContextService.UserId!);

            using var connection = sqlConnectionFactory.Create();

            var sql = @"
                    UPDATE tasks
                    SET done = false
                    WHERE id = @Id AND user_id = @UserId
                ";

            var affectedRows = await connection.ExecuteAsync(sql, new { request.Id, UserId = userId });

            if (affectedRows == 0)
            {
                return Result.Failure(Error.PermissionDenied("Todo not found or you do not have permission to mark this todo as not done."));
            }

            logger.LogInformation("Todo with id {TaskId} by user {UserId} has been marked as not done.", request.Id, userId);

            return Result.Success();
        }
    }
}
