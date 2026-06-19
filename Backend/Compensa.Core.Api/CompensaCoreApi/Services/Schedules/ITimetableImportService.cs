using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CompensaCoreApi.Dtos.Schedules;

namespace CompensaCoreApi.Services.Schedules;

public interface ITimetableImportService
{
    Task<TimetableImportPreviewResponse> ProcessTimetablesAsync(
        IEnumerable<(string Filename, byte[] Content)> files,
        Guid? academicYearId,
        CancellationToken cancellationToken = default);

    Task<int> ConfirmImportAsync(
        TimetableImportConfirmRequest request,
        CancellationToken cancellationToken = default);
}
