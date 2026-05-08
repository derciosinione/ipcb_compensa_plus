namespace CompensaIdentityApi.Infrastructure.OpenApi;

public static class SwaggerUiEndpointExtensions
{
    public static IEndpointRouteBuilder MapSwaggerUi(
        this IEndpointRouteBuilder endpoints,
        string title)
    {
        endpoints.MapGet("/swagger", () => Results.Redirect("/swagger/index.html", permanent: false));
        endpoints.MapGet("/swagger/index.html", () => Results.Content(GetSwaggerHtml(title), "text/html"));

        return endpoints;
    }

    private static string GetSwaggerHtml(string title) =>
        $$"""
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>{{title}} Swagger</title>
            <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
            <style>
              body { margin: 0; background: #f8fafc; }
              .swagger-ui .topbar { display: none; }
            </style>
          </head>
          <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
            <script>
              window.onload = () => {
                window.ui = SwaggerUIBundle({
                  url: '/openapi/v1.json',
                  dom_id: '#swagger-ui',
                  deepLinking: true,
                  presets: [SwaggerUIBundle.presets.apis],
                  layout: 'BaseLayout',
                });
              };
            </script>
          </body>
        </html>
        """;
}
