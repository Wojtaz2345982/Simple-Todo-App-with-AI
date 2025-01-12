using TaskAI.Common.Extensions;
using TaskAI.Infrastructure.Perstistence;
using TaskAI.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.AddNpgsqlDataSource("tasksdb");

builder.AddServiceDefaults();



// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddServices(builder.Configuration);
builder.Services.AddAuthentication(builder.Configuration);
builder.Services.AddEndpoints(typeof(Program).Assembly);
builder.Services.AddHostedService<DatabaseInitializer>();
builder.Services.AddSingleton(serviceProvider =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();

    var connectionString = configuration.GetConnectionString("tasksdb");

    return new SqlConnectionFactory(connectionString!);
});

builder.Services.AddSingleton(serviceProvider =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();

    var apiKey = configuration["OPENAI_API_KEY"];

    return new ChatClientFactory(apiKey!);
});



builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", builder =>
    {
        builder.WithOrigins("http://localhost:8080")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });

});


var app = builder.Build();

app.MapDefaultEndpoints();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowReact");
app.MapEndpoints();

app.UseHttpsRedirection();

app.Run();


