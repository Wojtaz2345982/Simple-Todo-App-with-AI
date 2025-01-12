using Dapper;
using FluentValidation;
using MediatR;
using System.Linq.Expressions;
using TaskAI.Common.Interfaces;
using TaskAI.Common.ResultTypes;
using TaskAI.Domain.Todos;
using TaskAI.Infrastructure.Services;
using static TaskAI.Features.Notes.AddNote;

namespace TaskAI.Features.Notes;

public class AddNoteEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("todos/{todoId:guid}/notes", async (Guid todoId, AddNoteRequest request, ISender sender) =>
        {
            var result = await sender.Send(new AddNoteCommand(todoId, request.Title, request.Context, request.CreatedAt));

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(result.Error);
        })
        .RequireAuthorization()
        .WithTags("Notes");
    }
}

public class Validator : AbstractValidator<AddNoteCommand>
{
    public Validator()
    {
        RuleFor(x => x.Title).NotEmpty();
        RuleFor(x => x.CreatedAt)
               .NotEmpty();
    }
}

public static class AddNote
{
    public record AddNoteRequest(string Title, string Context, DateTime CreatedAt);
    public record AddNoteCommand(Guid TaskId, string Title, string Content, DateTime CreatedAt) : IRequest<Result<AddNoteResponse>>;
    public record AddNoteResponse(Guid Id ,string Title, string Content, DateTime CreatedAt);

    internal sealed class Handler(
        SqlConnectionFactory sqlConnectionFactory,
        ILogger<Handler> logger,
        ICurrentUserService userContextService,
        IValidator<AddNoteCommand> validator) : IRequestHandler<AddNoteCommand, Result<AddNoteResponse>>
    {
        public async Task<Result<AddNoteResponse>> Handle(AddNoteCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (!validationResult.IsValid)
            {
                return Result.Failure<AddNoteResponse>(
                    Error.Validation(validationResult.ToString()));
            }

            using var connection = sqlConnectionFactory.Create();
            var userId = Guid.Parse(userContextService.UserId!);

            var getTaskSQL = @"
                    SELECT id
                    FROM tasks
                    WHERE id = @TaskId AND user_id = @UserId
                ";

            var task = await connection.QuerySingleOrDefaultAsync<TodoItem>(getTaskSQL, new { request.TaskId, UserId = userId });

            if(task is null)
            {
                return Result.Failure<AddNoteResponse>(
                    Error.NotFound("Task not found or you do not have permission to add note to this task."));
            }

            var sql = @"
                    INSERT INTO notes (task_id, title ,content, created_at)
                    VALUES (@TaskId, @Title , @Content, @CreatedAt)
                    RETURNING id
                ";

            var noteId = await connection.ExecuteScalarAsync<Guid>(sql, request);

            logger.LogInformation("Note has been added to task with id {TaskId} by user {UserId}.", request.TaskId, userId);

            return Result.Success(new AddNoteResponse(noteId, request.Title, request.Content, request.CreatedAt));
        }
    }
}
