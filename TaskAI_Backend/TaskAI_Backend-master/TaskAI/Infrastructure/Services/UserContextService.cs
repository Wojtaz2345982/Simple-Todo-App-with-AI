using System.Security.Claims;
using TaskAI.Common.Interfaces;

namespace TaskAI.Infrastructure.Services;

public class CurrentUserService(
    IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{


    public string UserId => httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)!;
}