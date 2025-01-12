var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin()
    .WithDataVolume()
    .AddDatabase("tasksdb");


builder.AddProject<Projects.TaskAI>("taskai")
    .WithReference(postgres);

builder.Build().Run();
