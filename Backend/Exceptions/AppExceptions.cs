namespace RetailMind.API.Exceptions;

/// <summary>
/// Base exception class for all custom domain exceptions.
/// </summary>
public abstract class AppException : Exception
{
    protected AppException(string message) : base(message) { }
}

/// <summary>
/// Represents a 404 Not Found error.
/// </summary>
public class NotFoundException : AppException
{
    public NotFoundException(string resourceName, object key) 
        : base($"The {resourceName} with identifier '{key}' was not found.") { }

    public NotFoundException(string message) : base(message) { }
}

/// <summary>
/// Represents a 400 Bad Request error due to failed business rules.
/// </summary>
public class BadRequestException : AppException
{
    public BadRequestException(string message) : base(message) { }
}

/// <summary>
/// Represents a 409 Conflict error, usually for duplicate data.
/// </summary>
public class ConflictException : AppException
{
    public ConflictException(string message) : base(message) { }
}
