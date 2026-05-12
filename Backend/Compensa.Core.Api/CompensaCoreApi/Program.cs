using System.Text.Json.Serialization;
using Microsoft.Extensions.Http.Resilience;
using System.Text;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using CompensaCoreApi.Contracts;
using CompensaCoreApi.Data;
using CompensaCoreApi.Infrastructure.Auth;
using CompensaCoreApi.Infrastructure.Database;
using CompensaCoreApi.Infrastructure.OpenApi;
using CompensaCoreApi.Middleware;
using CompensaCoreApi.Repositories.Assignments;
using CompensaCoreApi.Repositories.AcademicYears;
using CompensaCoreApi.Repositories.Classrooms;
using CompensaCoreApi.Repositories.CompensationRequests;
using CompensaCoreApi.Repositories.Courses;
using CompensaCoreApi.Services.Assignments;
using CompensaCoreApi.Services.AcademicYears;
using CompensaCoreApi.Services.Classrooms;
using CompensaCoreApi.Services.CompensationRequests;
using CompensaCoreApi.Services.Courses;
using CompensaCoreApi.Services.Dashboard;
using CompensaCoreApi.Services.Schedules;
using CompensaCoreApi.Services.Search;
using CompensaCoreApi.Services.Audit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MassTransit;
using OpenTelemetry.Resources;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;
using Microsoft.EntityFrameworkCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

var serviceName = "Compensa.Core.Api";
var otelEndpoint = builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"] ?? "http://otel-collector:4317";

// Add OpenTelemetry
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService(serviceName))
    .WithTracing(tracing =>
    {
        tracing.AddSource(serviceName)
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddOtlpExporter(options => options.Endpoint = new Uri(otelEndpoint));
    })
    .WithMetrics(metrics =>
    {
        metrics.AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddRuntimeInstrumentation()
            .AddOtlpExporter(options => options.Endpoint = new Uri(otelEndpoint));
    });

builder.Logging.AddOpenTelemetry(options =>
{
    options.IncludeFormattedMessage = true;
    options.IncludeScopes = true;
    options.SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(serviceName));
    options.AddOtlpExporter(options => options.Endpoint = new Uri(otelEndpoint));
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<CoreDbContext>(options =>
    options.UseNpgsql(connectionString)
           .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning)));

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("JWT settings are missing.");
var jwtSigningKeyValue = Environment.GetEnvironmentVariable("Jwt__SigningKey") ?? jwtOptions.SigningKey;

if (string.IsNullOrWhiteSpace(jwtSigningKeyValue) || jwtSigningKeyValue.Length < 32)
    throw new InvalidOperationException("JWT signing key must be configured with at least 32 characters.");

var jwtSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKeyValue));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = jwtSigningKey,
            IssuerSigningKeyResolver = (_, _, _, _) => [jwtSigningKey],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? ["http://localhost:5173"])
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddScoped<IClassroomRepository, ClassroomRepository>();
builder.Services.AddScoped<IClassroomService, ClassroomService>();
builder.Services.AddScoped<IAcademicYearRepository, AcademicYearRepository>();
builder.Services.AddScoped<IAcademicYearService, AcademicYearService>();
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IUserUnitAssignmentRepository, UserUnitAssignmentRepository>();
builder.Services.AddScoped<IUserUnitAssignmentService, UserUnitAssignmentService>();
builder.Services.AddScoped<ICompensationRequestRepository, CompensationRequestRepository>();
builder.Services.AddScoped<ICompensationRequestService, CompensationRequestService>();
builder.Services.AddScoped<IScheduleAvailabilityService, ScheduleAvailabilityService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IGlobalSearchService, GlobalSearchService>();
builder.Services.AddScoped<IAuditService, AuditService>();

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration["Redis__ConnectionString"] ?? "localhost:6379";
    options.InstanceName = "CompensaCore_";
});

builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitMqUrl = builder.Configuration.GetValue<string>("RabbitMq:Url") ?? "amqp://guest:guest@localhost:5672/";
        cfg.Host(new Uri(rabbitMqUrl));
        cfg.ConfigureEndpoints(context);
    });
});

builder.Services.AddHttpClient("CompensaAI")
    .AddStandardResilienceHandler();

builder.Services.AddHostedService<DatabaseStartupService>();

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(entry => entry.Value?.Errors.Count > 0)
                .ToDictionary(
                    entry => entry.Key,
                    entry => entry.Value!.Errors.Select(error => error.ErrorMessage).ToArray());

            return new BadRequestObjectResult(ApiResponse<object>.Fail("Validation failed.", errors));
        };
    });

builder.Services.AddOpenApi();

builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!);

var app = builder.Build();

app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
    app.MapSwaggerUi("Compensa Core API");
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = _ => true,
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
}).AllowAnonymous();

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
