namespace GadgetHub.API.Middleware
{
    public class SimpleAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly string _apiKey;
        private readonly IWebHostEnvironment _environment;

        public SimpleAuthMiddleware(
            RequestDelegate next,
            IWebHostEnvironment environment,
            IConfiguration configuration)
        {
            _next = next;
            _environment = environment;
            var configuredApiKey = configuration["GadgetHub:ApiKey"];
            if (string.IsNullOrWhiteSpace(configuredApiKey))
            {
                throw new InvalidOperationException("GadgetHub:ApiKey is not configured.");
            }

            _apiKey = configuredApiKey;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLower();

            if (HttpMethods.IsOptions(context.Request.Method))
            {
                await _next(context);
                return;
            }
            
            // Skip auth for specific endpoints
            if (path != null && (path.Contains("/swagger") || 
                                path.Contains("/test") || 
                                path.Equals("/") ||
                                path.Contains("/favicon") ||
                                path.Contains("/api/test"))) // Add explicit test API path
            {
                await _next(context);
                return;
            }

            // In development, be more permissive for easier testing
            if (_environment.IsDevelopment())
            {
                // Check if request has API key
                if (context.Request.Headers.TryGetValue("X-API-Key", out var apiKey) && 
                    apiKey == _apiKey)
                {
                    await _next(context);
                    return;
                }

                // If no API key, show helpful message but allow in development
                if (!context.Request.Headers.ContainsKey("X-API-Key"))
                {
                    // Add a warning header but still allow the request
                    context.Response.Headers["X-Auth-Warning"] = "API key recommended: add the X-API-Key header.";
                    await _next(context);
                    return;
                }
            }

            // Production-like behavior: require valid API key
            if (!context.Request.Headers.TryGetValue("X-API-Key", out var prodApiKey) || 
                prodApiKey != _apiKey)
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(@"{
                    ""error"": ""Unauthorized"",
                    ""message"": ""Valid API key required"",
                    ""hint"": ""Add the X-API-Key header with the configured API key."",
                    ""swagger"": ""Use the 'Authorize' button in Swagger UI to add the API key""
                }");
                return;
            }

            await _next(context);
        }
    }
} 
