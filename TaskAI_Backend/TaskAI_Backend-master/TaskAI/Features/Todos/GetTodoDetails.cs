using FluentValidation;
using MediatR;
using TaskAI.Common.Interfaces;
using TaskAI.Common.ResultTypes;
using TaskAI.Domain.Todos;
using static TaskAI.Features.Todos.AddTodo;
using TaskAI.Infrastructure.Services;
using Dapper;
using TaskAI.Domain.Notes;
using Mapster;

namespace TaskAI.Features.Todos;

public class GetTodoDetailsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/todos/{id:guid}", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new GetTodoDetails.GetTodoDetailsQuery(id));

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(result.Error);
        })
        .RequireAuthorization()
        .WithTags("Todos");
    }
}

public static class GetTodoDetails
{
    public record GetTodoDetailsQuery(Guid TodoId) : IRequest<Result<GetTodoDetailsResponse>>;

    public record NoteDto(Guid Id, string Title, string? Content, DateTime CreatedAt);
    public record GetTodoDetailsResponse(Guid Id, string Title, string Description, DateTime? Deadline, PriorityLevel PriorityLevel, bool Done, List<NoteDto> Notes);

    internal sealed class Handler(
           SqlConnectionFactory sqlConnectionFactory,
        ICurrentUserService userContextService) : IRequestHandler<GetTodoDetailsQuery, Result<GetTodoDetailsResponse>>
    {
        public async Task<Result<GetTodoDetailsResponse>> Handle(GetTodoDetailsQuery request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(userContextService.UserId!);

            using var connection = sqlConnectionFactory.Create();

            var sql = """
                SELECT 
                    t.id,
                    t.user_id,
                    t.title,
                    t.description,
                    t.deadline,
                    t.priority as PriorityLevel,
                    t.done,
                    n.id,
                    n.task_id as TodoItemId,
                    n.title,
                    n.content,
                    n.created_at as CreatedAt
                FROM tasks t
                LEFT JOIN notes n ON t.id = n.task_id
                WHERE t.id = @TodoId AND t.user_id = @UserId
                """;

            var todoDictionary = new Dictionary<Guid, TodoItem>();

            await connection.QueryAsync<TodoItem, Note, TodoItem>(
             sql,
            (todo, note) =>
            {
                if (!todoDictionary.TryGetValue(todo.Id, out var existingTodo))
                {
                    existingTodo = todo;
                    existingTodo.Notes = new List<Note>();
                    todoDictionary[todo.Id] = existingTodo;
                }

                if (note != null && note.Id != Guid.Empty)
                {
                    existingTodo.Notes.Add(note);
                }

                return existingTodo;
            },
            new { TodoId = request.TodoId, UserId = userId },
            splitOn: "id"
            );

            var todo = todoDictionary.Values.FirstOrDefault();

            var todoResponse = todo.Adapt<GetTodoDetailsResponse>();

            if (todo is null)
            {
                return Result.Failure<GetTodoDetailsResponse>(
                    Error.NotFound("Todo not found or you do not have permission to view this todo."));
            }

            return Result.Success(todoResponse);
        }
    }
}
