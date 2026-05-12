namespace CompensaCoreApi.Dtos.CompensationRequests;

public record CompensationRequestDocumentResponse(
    Guid Id,
    Guid CompensationRequestId,
    string FileName,
    long SizeInBytes,
    string ContentType,
    DateTimeOffset CreatedAt);
