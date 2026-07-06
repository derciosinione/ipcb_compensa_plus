using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Dtos.CompensationRequests;

namespace CompensaCoreApi.Services.CompensationRequests;

public interface ICompensationRequestService
{
    Task<IReadOnlyCollection<CompensationRequestResponse>> ListAsync(
        CompensationRequestStatus? status,
        string? teacherUserId,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);

    Task<CompensationRequestResponse> GetByIdAsync(
        Guid id,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);

    Task<CompensationRequestResponse> CreateAsync(
        CreateCompensationRequestRequest request,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);

    Task<CompensationRequestResponse> UpdateAsync(
        Guid id,
        UpdateCompensationRequestRequest request,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);

    Task<CompensationRequestResponse> UpdateStatusAsync(
        Guid id,
        UpdateCompensationRequestStatusRequest request,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid id,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);

    Task<CompensationRequestDocumentResponse> UploadDocumentAsync(
        Guid requestId,
        Stream fileStream,
        string fileName,
        string contentType,
        long sizeInBytes,
        string actorUserId,
        string actorName,
        string role,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<CompensationRequestDocumentResponse>> ListDocumentsAsync(
        Guid requestId,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);

    Task<(Stream Stream, string FileName, string ContentType)> GetDocumentFileAsync(
        Guid requestId,
        Guid documentId,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);

    Task DeleteDocumentAsync(
        Guid requestId,
        Guid documentId,
        string actorUserId,
        bool isCoordinator,
        bool isAdmin,
        CancellationToken cancellationToken = default);

    // Comment methods
    Task<CompensationRequestCommentResponse> AddCommentAsync(
        Guid requestId,
        string text,
        string actorUserId,
        string actorName,
        string role,
        CancellationToken cancellationToken = default);
}
