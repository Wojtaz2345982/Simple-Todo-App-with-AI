using FluentValidation;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using System.Reflection;
using TaskAI.Common.Interfaces;
using TaskAI.Infrastructure.Services;

namespace TaskAI.Common.Extensions;

public static class ServiceCollectionExtensions
{

    public static void AddServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        var assembly = Assembly.GetExecutingAssembly();
        services.AddMediatR(config => config.RegisterServicesFromAssembly(assembly));
        services.AddValidatorsFromAssembly(assembly);
    }

    public static IServiceCollection AddEndpoints(
      this IServiceCollection services,
      Assembly assembly)
    {
        ServiceDescriptor[] serviceDescriptors = assembly
            .DefinedTypes
            .Where(type => type is { IsAbstract: false, IsInterface: false } &&
                           type.IsAssignableTo(typeof(IEndpoint)))
            .Select(type => ServiceDescriptor.Transient(typeof(IEndpoint), type))
            .ToArray();

        services.TryAddEnumerable(serviceDescriptors);

        return services;
    }

    public static void AddAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthorization();

        var bytes = System.Text.Encoding.UTF8.GetBytes(configuration["JWTSecretKey"]!);

        services.AddAuthentication().AddJwtBearer(opt =>
        {
            opt.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                IssuerSigningKey = new SymmetricSecurityKey(bytes),
                ValidAudience = configuration["Auth:ValidAudience"],
                ValidIssuer = configuration["Auth:ValidIssuer"],
            };
        });
    }


}
