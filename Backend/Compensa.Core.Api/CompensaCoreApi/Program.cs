using System.Text.Json.Serialization;
using System.Text;
using CompensaCoreApi.Contracts;
using CompensaCoreApi.Data;
using CompensaCoreApi.Infrastructure.Auth;
using CompensaCoreApi.Infrastructure.Database;
using CompensaCoreApi.Infrastructure.OpenApi;
using CompensaCoreApi.Middleware;
using CompensaCoreApi.Repositories.Classrooms;
using CompensaCoreApi.Repositories.CompensationRequests;
using CompensaCoreApi.Repositories.Courses;
using CompensaCoreApi.Services.Classrooms;
using CompensaCoreApi.Services.CompensationRequests;
using CompensaCoreApi.Services.Courses;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<CoreDbContext>(options =>
    options.UseNpgsql(connectionString));

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
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<ICompensationRequestRepository, CompensationRequestRepository>();
builder.Services.AddScoped<ICompensationRequestService, CompensationRequestService>();
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

app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "compensa-core-api" }))
    .AllowAnonymous();

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
