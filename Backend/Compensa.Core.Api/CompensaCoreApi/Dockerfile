FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Backend/Compensa.Core.Api/CompensaCoreApi/CompensaCoreApi.csproj Backend/Compensa.Core.Api/CompensaCoreApi/
RUN dotnet restore Backend/Compensa.Core.Api/CompensaCoreApi/CompensaCoreApi.csproj

COPY Backend/Compensa.Core.Api/CompensaCoreApi/ Backend/Compensa.Core.Api/CompensaCoreApi/
WORKDIR /src/Backend/Compensa.Core.Api/CompensaCoreApi
RUN dotnet publish CompensaCoreApi.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM runtime AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CompensaCoreApi.dll"]
