# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["RetailMind.API.csproj", "./"]
RUN dotnet restore "RetailMind.API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/"
RUN dotnet build "RetailMind.API.csproj" -c Release -o /app/build

# Stage 2: Publish the application
FROM build AS publish
RUN dotnet publish "RetailMind.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose ports
EXPOSE 8080
EXPOSE 8081

ENTRYPOINT ["dotnet", "RetailMind.API.dll"]
