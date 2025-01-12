using System.Text.Json.Serialization;
using TaskAI.Domain.Notes;

namespace TaskAI.Domain.Todos;

public class TodoItem
{
    public Guid Id { get; set; }
    [JsonPropertyName("user_Id")]
    public Guid UserId { get; set; }

    public string Title { get; set; } = default!;
    public string? Description { get; set; }

    public DateTime? Reminder { get; set; }
    public DateTime? Deadline { get; set; }
    public PriorityLevel PriorityLevel { get; set; } = PriorityLevel.None;

    public bool Done { get; set; }

    public List<Note> Notes { get; set; } = [];
}

public enum PriorityLevel
{
    None = 0,
    Low = 1,
    Medium = 2,
    High = 3,
}
