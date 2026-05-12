FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Backend/Compensa.Gateway/CompensaGateway/CompensaGateway.csproj Backend/Compensa.Gateway/CompensaGateway/
RUN dotnet restore Backend/Compensa.Gateway/CompensaGateway/CompensaGateway.csproj

COPY Backend/Compensa.Gateway/CompensaGateway/ Backend/Compensa.Gateway/CompensaGateway/
WORKDIR /src/Backend/Compensa.Gateway/CompensaGateway
RUN dotnet publish CompensaGateway.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM runtime AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CompensaGateway.dll"]
