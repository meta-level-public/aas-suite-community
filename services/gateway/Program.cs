var builder = WebApplication.CreateBuilder(args);

gateway.GatewayBootstrap.ConfigureHost(builder);
gateway.GatewayBootstrap.ConfigureServices(builder);

var app = builder.Build();

gateway.GatewayBootstrap.ConfigurePipeline(app);

app.Run();
