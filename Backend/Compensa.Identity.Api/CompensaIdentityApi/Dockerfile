FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Backend/Compensa.Identity.Api/CompensaIdentityApi/CompensaIdentityApi.csproj Backend/Compensa.Identity.Api/CompensaIdentityApi/
RUN dotnet restore Backend/Compensa.Identity.Api/CompensaIdentityApi/CompensaIdentityApi.csproj

COPY Backend/Compensa.Identity.Api/CompensaIdentityApi/ Backend/Compensa.Identity.Api/CompensaIdentityApi/
WORKDIR /src/Backend/Compensa.Identity.Api/CompensaIdentityApi
RUN dotnet publish CompensaIdentityApi.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM runtime AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CompensaIdentityApi.dll"]
