namespace TaskAI.Common.ResultTypes;

public record Error(string Code, string Message)
{
    public static readonly Error None = new(string.Empty, string.Empty);

    public static readonly Error NullValue = new("Error.NullValue", "The specified result value is null.");

    public static readonly Error ConditionNotMet = new("Error.ConditionNotMet", "The specified condition was not met.");

    public static Error NotFound(string code) => new(code, "The specified entity was not found.");
    public static Error PermissionDenied(string message) => new("Permission.Denied", message);
    public static Error Validation(string details) => new("Error.Validation", details);
    public static Error ThirdPartyReqeustError(string details) => new("There was an error calling extnernal api.", details);
}
