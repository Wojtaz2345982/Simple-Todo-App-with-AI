using Dapper;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using TaskAI.Common.Interfaces;
using TaskAI.Common.ResultTypes;
using TaskAI.Domain.Todos;
using TaskAI.Infrastructure.Services;

namespace TaskAI.Features.Todos;

public class AddTodoEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/todos", async ([FromBody] AddTodo.AddTodoCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(result.Error.Message);
        })
        .RequireAuthorization()
        .WithTags("Todos");

    }
}

public static class AddTodo
{
    public record AddTodoCommand(string Title, string? Description, DateTime? Deadline, PriorityLevel PriorityLevel) : IRequest<Result<AddTodoResponse>>;

    public record AddTodoResponse(Guid TaskId, Guid UserId,string Title, string Description, DateTime? Deadline, PriorityLevel PriorityLevel);

    public class Validator : AbstractValidator<AddTodoCommand>
    {
        public Validator()
        {
            RuleFor(x => x.Title).NotEmpty();
            RuleFor(x => x.PriorityLevel)
                .IsInEnum()
                .WithMessage("Priority level need to be between 1 and 3 (1 - low | 2 - medium | 3 - high).");
            RuleFor(x => x.Deadline)
                .GreaterThan(DateTime.Now)
                .WithMessage("Deadline must be in the future.");
        }
    }

    internal sealed class Handler(
        SqlConnectionFactory sqlConnectionFactory,
        ILogger<Handler> logger,
        IValidator<AddTodoCommand> validator,
        ICurrentUserService userContextService) : IRequestHandler<AddTodoCommand, Result<AddTodoResponse>>
    {
        public async Task<Result<AddTodoResponse>> Handle(AddTodoCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);

            var userId = Guid.Parse(userContextService.UserId!);

            if (!validationResult.IsValid)
            {
                return Result.Failure<AddTodoResponse>(
                    Error.Validation(validationResult.ToString()));
            }

            using var connection = sqlConnectionFactory.Create();

            var sql = """
                    INSERT INTO tasks (user_id, title, description, deadline, priority)
                    VALUES (@UserId,@Title, @Description, @Deadline, @PriorityLevel)
                    RETURNING id
                """;

            var taskId = await connection.ExecuteScalarAsync<Guid>(sql, new
            {
                UserId = userId,
                request.Title,
                request.Description,
                request.Deadline,
                request.PriorityLevel
            });

            var result = new AddTodoResponse(taskId, userId, request.Title, request.Description!, request.Deadline, request.PriorityLevel);

            logger.LogInformation("Todo with id {TaskId} by user {UserId} has been added.", taskId, userId);

            return result;
        }
    }
}
