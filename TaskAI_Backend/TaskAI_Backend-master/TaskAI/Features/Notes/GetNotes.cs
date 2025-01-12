using Dapper;
using Mapster;
using MediatR;
using TaskAI.Common.Interfaces;
using TaskAI.Common.ResultTypes;
using TaskAI.Domain.Notes;
using TaskAI.Domain.Todos;
using TaskAI.Infrastructure.Services;

namespace TaskAI.Features.Notes;

public class GetNotesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("todos/{todoId:guid}/notes", async (Guid todoId, ISender sender) =>
        {
            var result = await sender.Send(new GetNotes.GetNotesRequest(todoId));

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(result.Error);
        })
        .RequireAuthorization()
        .WithTags("Notes");
    }
}

public static class GetNotes
{
    public record GetNotesRequest(Guid TodoId) : IRequest<Result<List<GetNotesResponse>>>;
    public record GetNotesResponse(Guid Id, string Title, string Content, DateTime CreatedAt);

    internal sealed class Handler(
        SqlConnectionFactory sqlConnectionFactory) : IRequestHandler<GetNotesRequest, Result<List<GetNotesResponse>>>
    {
        public async Task<Result<List<GetNotesResponse>>> Handle(GetNotesRequest request, CancellationToken cancellationToken)
        {
            var connection = sqlConnectionFactory.Create();

            var sql = """
                SELECT id, title, content, created_at   
                FROM notes
                WHERE task_id = @TodoId
                """;

            var notes = await connection.QueryAsync<Note>(sql, request);

            var notesDtos = notes.Adapt<List<GetNotesResponse>>();

            return Result.Success(notesDtos);
        }
    }
}
