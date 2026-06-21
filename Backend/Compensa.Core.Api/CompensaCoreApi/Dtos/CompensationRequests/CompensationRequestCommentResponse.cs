using System;

namespace CompensaCoreApi.Dtos.CompensationRequests;

public sealed record CompensationRequestCommentResponse(
    Guid Id,
    Guid CompensationRequestId,
    string AuthorUserId,
    string AuthorName,
    string Role,
    string Text,
    DateTimeOffset CreatedAt);
