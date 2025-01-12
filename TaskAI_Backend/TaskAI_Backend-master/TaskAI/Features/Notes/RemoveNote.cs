using Dapper;
using MediatR;
using TaskAI.Common.Interfaces;
using TaskAI.Common.ResultTypes;
using TaskAI.Domain.Todos;
using TaskAI.Infrastructure.Services;
using static TaskAI.Features.Notes.AddNote;
using static TaskAI.Features.Notes.RemoveNote;

namespace TaskAI.Features.Notes;

public class RemoveNoteEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("todos/{todoId:guid}/notes/{noteId:guid}", async (Guid todoId, Guid noteId, ISender sender) =>
        {
            var result = await sender.Send(new RemoveNoteCommand(todoId, noteId));

            return result.IsSuccess
                ? Results.Ok()
                : Results.BadRequest(result.Error);
        })
        .RequireAuthorization()
        .WithTags("Notes");
    }
}

public static class RemoveNote
{
    public record RemoveNoteCommand(Guid TaskId ,Guid NoteId) : IRequest<Result>;

    internal sealed class Handler(
        ICurrentUserService currentUserService,
        SqlConnectionFactory sqlConnectionFactory,
        ILogger<Handler> logger) : IRequestHandler<RemoveNoteCommand, Result>
    {
        public async Task<Result> Handle(RemoveNoteCommand request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(currentUserService.UserId!);

            using var connection = sqlConnectionFactory.Create();

            var getTaskSQL = @"
                    SELECT id
                    FROM tasks
                    WHERE id = @TaskId AND user_id = @UserId
                ";

            var task = await connection.QuerySingleOrDefaultAsync<TodoItem>(getTaskSQL, new { request.TaskId, UserId = userId });

            if (task is null)
            {
                return Result.Failure<AddNoteResponse>(
                    Error.NotFound("Task not found or you do not have permission to add note to this task."));
            }

            var sql = """
                    DELETE FROM notes
                    WHERE id = @NoteId
                """;

            await connection.ExecuteAsync(sql, new { request.NoteId });

            logger.LogInformation("Note with id {NoteId} has been removed from task with id {TaskId} by user {UserId}.", request.NoteId, request.TaskId, userId);

            return Result.Success();         
        }
    }
}
