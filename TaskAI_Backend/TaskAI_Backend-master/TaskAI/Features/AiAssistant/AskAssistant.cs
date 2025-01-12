using FluentValidation;
using MediatR;
using OpenAI.Chat;
using TaskAI.Common.Interfaces;
using TaskAI.Common.ResultTypes;
using TaskAI.Infrastructure.Services;

namespace TaskAI.Features.AiAssistant;

public class AskAssistantEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/assistant/question", async (AskAssistant.AskAssistantCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(result.Error);
        })
        .WithTags("Assistant");
    }
}

public static class AskAssistant
{

    public record AskAssistantCommand(string Title, string Description, string UserQuestion) : IRequest<Result<AskAssistantResponse>>;
    public record AskAssistantResponse(string AssistantResponse);

    public class Validator : AbstractValidator<AskAssistantCommand>
    {
        public Validator()
        {
            RuleFor(x => x.Title).NotEmpty();
            RuleFor(x => x.UserQuestion)
                .MaximumLength(100)
                .NotEmpty();
        }
    }

    internal sealed class Handler(
        ChatClientFactory chatClientFactory,
        IValidator<AskAssistantCommand> validator) : IRequestHandler<AskAssistantCommand, Result<AskAssistantResponse>>
    {
        readonly SystemChatMessage SystemChatMessage = new("You are a helpful assistant in a ToDo application. Your role is to provide tips, advice, " +
         "and suggestions related to tasks that a user might add to their to-do list. " +
         "When a user provides a task title and description, " +
         "you will offer useful guidance or recommendations that might help the user in completing that task. " +
         "\r\n\r\nFor example, if the user adds a task like \"Buy groceries\", " +
         "you might suggest helpful steps like \"Create a shopping list\" or \"Check for discounts at local stores\". " +
         "If the task is more complex, " +
         "you might provide additional tips such as \"Break it down into smaller steps\" or \"Set a deadline for each step\".\r\n\r\n" +
         "If the query is unrelated to the ToDo application, kindly inform the user with a message like \"Sorry, I can only assist with tasks related to your to-do list.\" " +
         "If you do not know the answer to a question, reply with \"I'm not sure about that, but I can help you with tasks related to your to-do list.\"\r\n\r\n" +
         "You should always avoid making up information. If you're unsure, just let the user know that you don't have the answer.\r\n\r\n" +
         "Your responses should be helpful, clear, concise, and as brief as possible while still offering value. " +
         "Avoid lengthy explanations. Always encourage the user to keep their tasks organized and stay on track to be more productive.");

        public async Task<Result<AskAssistantResponse>> Handle(AskAssistantCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (!validationResult.IsValid)
            {
                return Result.Failure<AskAssistantResponse>(
                    Error.Validation(validationResult.ToString()));
            }

            var chatClient = chatClientFactory.Create();

            UserChatMessage userChatMessage = new($"TaskTitle: {request.Title}. TaskDescription: {request.Description}. User question: {request.UserQuestion}");
            try
            {
                ChatCompletion completion = chatClient.CompleteChat(SystemChatMessage, userChatMessage);
                return Result.Success(new AskAssistantResponse(completion.Content[0].Text));
            }
            catch (Exception)
            {

                return Result.Failure<AskAssistantResponse>(
                    Error.ThirdPartyReqeustError("Error while asking OpenAI API."));
            }

        }
    }
}
