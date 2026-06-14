using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.RateLimiting;
using RetailMind.API.Data;
using RetailMind.API.Data.Seeders;
using RetailMind.API.Middleware;
using RetailMind.API.Models.Identity;
using RetailMind.API.Services.Auth;
using RetailMind.API.Services.Email;
using RetailMind.API.Services.Inventory;
using RetailMind.API.Services.Orders;
using RetailMind.API.Services.Employees;
using RetailMind.API.Services.ML;
using RetailMind.API.Repositories.Inventory;
using RetailMind.API.Repositories.Orders;
using RetailMind.API.Repositories.Employees;
using Serilog;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using System.Reflection;
using System.Threading.RateLimiting;
using MicroElements.Swashbuckle.FluentValidation.AspNetCore;

// ──────────────────────────────────────────────────────────────────────────────
//  Bootstrap Serilog early so startup errors are also captured
// ──────────────────────────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // ── Serilog ──────────────────────────────────────────────────────────────
    builder.Host.UseSerilog((context, services, configuration) =>
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File(
                path: "Logs/retailmind-.log",
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 30));

    // ── Controllers ──────────────────────────────────────────────────────────
    builder.Services.AddControllers()
        .ConfigureApiBehaviorOptions(options =>
        {
            options.InvalidModelStateResponseFactory = context =>
            {
                var errors = context.ModelState
                    .Where(e => e.Value?.Errors.Count > 0)
                    .SelectMany(e => e.Value!.Errors.Select(x => x.ErrorMessage))
                    .ToList();

                var response = RetailMind.API.DTOs.Common.ApiResponse<object>.Fail(
                    "Validation failed.", errors);

                return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(response);
            };
        });

    // ── FluentValidation ─────────────────────────────────────────────────────
    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

    // ── AutoMapper ───────────────────────────────────────────────────────────
    builder.Services.AddAutoMapper(Assembly.GetExecutingAssembly());

    // ── Database – PostgreSQL via EF Core ────────────────────────────────────
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            npgsqlOptions => npgsqlOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

    // ── Distributed Caching – Redis ──────────────────────────────────────────
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = builder.Configuration.GetConnectionString("Redis");
        options.InstanceName  = "RetailMind:";
    });

    // ── ASP.NET Core Identity ────────────────────────────────────────────────
    builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        // ── Password ──────────────────────────────────────────────────────────
        options.Password.RequiredLength         = 8;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequireUppercase       = true;
        options.Password.RequireDigit           = true;
        options.Password.RequiredUniqueChars    = 4;

        // ── User ──────────────────────────────────────────────────────────────
        options.User.RequireUniqueEmail = true;

        // ── Sign-in ───────────────────────────────────────────────────────────
        options.SignIn.RequireConfirmedEmail   = false;  // flip to true with email service
        options.SignIn.RequireConfirmedAccount = false;

        // ── Lockout (brute-force protection) ──────────────────────────────────
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan  = TimeSpan.FromMinutes(15);
        options.Lockout.AllowedForNewUsers      = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

    // ── JWT Authentication ────────────────────────────────────────────────────
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    var secretKey   = jwtSettings["SecretKey"]
                      ?? throw new InvalidOperationException("JWT SecretKey is not configured.");

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtSettings["Issuer"],
            ValidAudience            = jwtSettings["Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew                = TimeSpan.Zero
        };
    });

    builder.Services.AddAuthorization();

    // ── CORS ─────────────────────────────────────────────────────────────────
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
            policy.AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader());

        options.AddPolicy("ProductionPolicy", policy =>
            policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [])
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());
    });

    // ── Rate Limiting ─────────────────────────────────────────────────────────
    builder.Services.AddRateLimiter(options =>
    {
        options.AddFixedWindowLimiter("fixed", opt =>
        {
            opt.PermitLimit = 10;
            opt.Window = TimeSpan.FromSeconds(10);
        });
    });

    // ── Swagger / OpenAPI ─────────────────────────────────────────────────────
    builder.Services.AddEndpointsApiExplorer();
    
    // Bind FluentValidation rules to Swagger so clients see exactly what is required
    builder.Services.AddFluentValidationRulesToSwagger();

    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title       = "RetailMind AI API",
            Version     = "v1",
            Description = "AI-Powered Retail & Supply Chain Optimization Platform",
            Contact     = new OpenApiContact
            {
                Name  = "RetailMind Team",
                Email = "support@retailmind.ai"
            }
        });

        // JWT security definition for Swagger UI
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name         = "Authorization",
            Type         = SecuritySchemeType.ApiKey,
            Scheme       = "Bearer",
            BearerFormat = "JWT",
            In           = ParameterLocation.Header,
            Description  = "Enter: Bearer {your-jwt-token}"
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id   = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });

        // Include XML comments
        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
            options.IncludeXmlComments(xmlPath);
    });

    // ── Application Services (DI) ─────────────────────────────────────────────

    // Auth
    builder.Services.AddScoped<IAuthService, AuthService>();

    // Email (swap DevEmailService with real implementation in production)
    builder.Services.AddScoped<IEmailService, DevEmailService>();

    // Inventory — Products
    builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();
    builder.Services.AddScoped<IInventoryService, InventoryService>();

    // Inventory — Suppliers
    builder.Services.AddScoped<ISupplierRepository, SupplierRepository>();
    builder.Services.AddScoped<ISupplierService, SupplierService>();

    // Inventory — Categories
    builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
    builder.Services.AddScoped<ICategoryService, CategoryService>();

    // Orders
    builder.Services.AddScoped<IOrderRepository, OrderRepository>();
    builder.Services.AddScoped<IOrderService, OrderService>();

    // Employees
    builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
    builder.Services.AddScoped<IEmployeeService, EmployeeService>();

    // ── ML Service (typed HttpClient — BaseAddress from config or env var) ──
    builder.Services.AddHttpClient<IMLService, MLService>(client =>
    {
        var mlUrl = builder.Configuration["MLServiceUrl"] ?? "http://localhost:8001";
        client.BaseAddress = new Uri(mlUrl);
        client.Timeout = TimeSpan.FromSeconds(30); // ML inference can be slow
    });

    // Health checks
    builder.Services.AddHealthChecks()
        .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!);

    // ── HttpContext accessor ──────────────────────────────────────────────────
    builder.Services.AddHttpContextAccessor();

    // ─────────────────────────────────────────────────────────────────────────
    //  Build the app
    // ─────────────────────────────────────────────────────────────────────────
    var app = builder.Build();

    // ── Correlation ID ────────────────────────────────────────────────────────
    app.UseMiddleware<CorrelationIdMiddleware>();

    // ── Global exception handler ──────────────────────────────────────────────
    app.UseMiddleware<GlobalExceptionMiddleware>();

    // ── Security Headers ──────────────────────────────────────────────────────
    app.UseMiddleware<SecurityHeadersMiddleware>();

    // ── Request logging ───────────────────────────────────────────────────────
    app.UseSerilogRequestLogging(opts =>
    {
        opts.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms | CorrelationId: {CorrelationId}";
    });

    // ── Development tools ─────────────────────────────────────────────────────
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "RetailMind AI API v1");
            options.RoutePrefix = string.Empty;   // Swagger at root
            options.DisplayRequestDuration();
            options.EnableDeepLinking();
        });
    }

    // ── HTTPS Redirect ────────────────────────────────────────────────────────
    app.UseHttpsRedirection();

    // ── CORS ──────────────────────────────────────────────────────────────────
    app.UseCors(app.Environment.IsDevelopment() ? "AllowAll" : "ProductionPolicy");

    // ── Rate Limiter ──────────────────────────────────────────────────────────
    app.UseRateLimiter();

    // ── Auth ──────────────────────────────────────────────────────────────────
    app.UseAuthentication();
    app.UseAuthorization();

    // ── Request Timing Middleware ─────────────────────────────────────────────
    app.UseMiddleware<RequestTimingMiddleware>();

    // ── Endpoints ────────────────────────────────────────────────────────────
    app.MapControllers();
    app.MapHealthChecks("/health");

    // ── Auto-migrate + seed on startup ───────────────────────────────────────
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (app.Environment.IsDevelopment())
            await db.Database.MigrateAsync();

        // Idempotent — seeds all roles + default Admin on every restart
        await RoleSeeder.SeedAsync(scope.ServiceProvider);
    }

    Log.Information("RetailMind API starting up in {Environment} mode", app.Environment.EnvironmentName);
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "RetailMind API terminated unexpectedly");
}
finally
{
    await Log.CloseAndFlushAsync();
}
