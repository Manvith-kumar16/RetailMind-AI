namespace RetailMind.API.DTOs.Common;

/// <summary>Standardized API response envelope.</summary>
public sealed class ApiResponse<T>
{
    public bool   Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public T?     Data    { get; init; }
    public IEnumerable<string>? Errors { get; init; }
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;

    public static ApiResponse<T> Ok(T data, string message = "Success") =>
        new() { Success = true, Message = message, Data = data };

    public static ApiResponse<T> Fail(string message, IEnumerable<string>? errors = null) =>
        new() { Success = false, Message = message, Errors = errors };
}

/// <summary>Generic paginated list response.</summary>
public sealed class PagedResponse<T>
{
    public IEnumerable<T> Data       { get; init; } = [];
    public int            TotalCount { get; init; }
    public int            Page       { get; init; }
    public int            PageSize   { get; init; }
    public int            TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool           HasNext    => Page < TotalPages;
    public bool           HasPrev    => Page > 1;
}

/// <summary>Query parameters for list endpoints.</summary>
public sealed record PaginationQuery(
    int    Page     = 1,
    int    PageSize = 20,
    string? Search  = null,
    string? SortBy  = null,
    bool   Desc     = false);
