namespace TaskAI.Domain.Notes;

public class Note
{
    public Guid Id { get; set; }
    public Guid TodoItemId { get; set; }

    public string Title { get; set; } = default!;

    public string? Content { get; set; }

    public DateTime CreatedAt { get; set; }
}
