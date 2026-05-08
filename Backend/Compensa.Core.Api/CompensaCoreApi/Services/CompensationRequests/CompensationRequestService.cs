using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Dtos.CompensationRequests;
using CompensaCoreApi.Exceptions;
using CompensaCoreApi.Repositories.CompensationRequests;

namespace CompensaCoreApi.Services.CompensationRequests;

public sealed class CompensationRequestService : ICompensationRequestService
{
    private readonly ICompensationRequestRepository _repository;

    public CompensationRequestService(ICompensationRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyCollection<CompensationRequestResponse>> ListAsync(
        CompensationRequestStatus? status,
        string? teacherUserId,
        CancellationToken cancellationToken = default)
    {
        var requests = await _repository.ListAsync(status, teacherUserId, cancellationToken);
        return requests.Select(ToResponse).ToArray();
    }

    public async Task<CompensationRequestResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var request = await GetRequiredRequestAsync(id, cancellationToken);
        return ToResponse(request);
    }

    public async Task<CompensationRequestResponse> CreateAsync(
        CreateCompensationRequestRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateSchedule(request.OriginalStartTime, request.OriginalEndTime, "original");
        ValidateSchedule(request.NewStartTime, request.NewEndTime, "new");

        var now = DateTimeOffset.UtcNow;
        var compensationRequest = new CompensationRequest
        {
            TeacherUserId = request.TeacherUserId.Trim(),
            TeacherName = request.TeacherName.Trim(),
            Course = request.Course.Trim(),
            CurricularUnit = request.CurricularUnit.Trim(),
            YearGroups = request.YearGroups.Select(group => group.Trim()).Where(group => group.Length > 0).ToArray(),
            ComponentType = request.ComponentType,
            OriginalDate = request.OriginalDate,
            OriginalStartTime = request.OriginalStartTime,
            OriginalEndTime = request.OriginalEndTime,
            OriginalRoom = request.OriginalRoom.Trim(),
            NewDate = request.NewDate,
            NewStartTime = request.NewStartTime,
            NewEndTime = request.NewEndTime,
            NewRoom = request.NewRoom.Trim(),
            Justification = request.Justification.Trim(),
            Status = CompensationRequestStatus.Pending,
            SubmittedAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };

        await _repository.AddAsync(compensationRequest, cancellationToken);
        return ToResponse(compensationRequest);
    }

    public async Task<CompensationRequestResponse> UpdateStatusAsync(
        Guid id,
        UpdateCompensationRequestStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        var compensationRequest = await GetRequiredRequestAsync(id, cancellationToken);

        if (compensationRequest.Status is CompensationRequestStatus.Cancelled)
            throw new InvalidOperationException("Cancelled requests cannot be changed.");

        if (request.Status is CompensationRequestStatus.Rejected && string.IsNullOrWhiteSpace(request.DecisionComment))
            throw new InvalidOperationException("Rejected requests require a decision comment.");

        compensationRequest.Status = request.Status;
        compensationRequest.DecisionComment = request.DecisionComment?.Trim();
        compensationRequest.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.SaveChangesAsync(cancellationToken);
        return ToResponse(compensationRequest);
    }

    private async Task<CompensationRequest> GetRequiredRequestAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Compensation request '{id}' was not found.");
    }

    private static void ValidateSchedule(TimeOnly startTime, TimeOnly endTime, string label)
    {
        if (startTime >= endTime)
            throw new InvalidOperationException($"The {label} start time must be before the end time.");
    }

    private static CompensationRequestResponse ToResponse(CompensationRequest request)
    {
        return new CompensationRequestResponse(
            request.Id,
            request.TeacherUserId,
            request.TeacherName,
            request.Course,
            request.CurricularUnit,
            request.YearGroups,
            request.ComponentType,
            request.OriginalDate,
            request.OriginalStartTime,
            request.OriginalEndTime,
            request.OriginalRoom,
            request.NewDate,
            request.NewStartTime,
            request.NewEndTime,
            request.NewRoom,
            request.Justification,
            request.Status,
            request.DecisionComment,
            request.HasConflict,
            request.SubmittedAt,
            request.CreatedAt,
            request.UpdatedAt);
    }
}
