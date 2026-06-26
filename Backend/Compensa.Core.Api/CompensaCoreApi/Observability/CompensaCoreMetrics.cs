using System.Diagnostics.Metrics;
using CompensaCoreApi.Domain.CompensationRequests;

namespace CompensaCoreApi.Observability;

public static class CompensaCoreMetrics
{
    public const string MeterName = "Compensa.Core.Api.Business";

    private static readonly Meter Meter = new(MeterName);

    private static readonly Counter<long> CompensationRequestsCreated = Meter.CreateCounter<long>(
        "compensa_core_compensation_requests_created_total",
        unit: "{request}",
        description: "Number of compensation requests created.");

    private static readonly Counter<long> CompensationRequestStatusChanges = Meter.CreateCounter<long>(
        "compensa_core_compensation_request_status_changes_total",
        unit: "{transition}",
        description: "Number of compensation request status transitions.");

    private static readonly Counter<long> CompensationRequestsDeleted = Meter.CreateCounter<long>(
        "compensa_core_compensation_requests_deleted_total",
        unit: "{request}",
        description: "Number of compensation requests deleted.");

    private static readonly Counter<long> CompensationRequestDocumentsUploaded = Meter.CreateCounter<long>(
        "compensa_core_compensation_request_documents_uploaded_total",
        unit: "{document}",
        description: "Number of documents uploaded to compensation requests.");

    private static readonly Histogram<double> CompensationRequestDecisionLatency = Meter.CreateHistogram<double>(
        "compensa_core_compensation_request_decision_latency_hours",
        unit: "h",
        description: "Time between compensation request submission and final decision.");

    public static void RecordCompensationRequestCreated(string actorRole, bool createdForSelf)
    {
        CompensationRequestsCreated.Add(
            1,
            new KeyValuePair<string, object?>("actor_role", actorRole),
            new KeyValuePair<string, object?>("created_for_self", createdForSelf));
    }

    public static void RecordCompensationRequestStatusChanged(
        CompensationRequestStatus from,
        CompensationRequestStatus to,
        string actorRole,
        double? decisionLatencyHours)
    {
        CompensationRequestStatusChanges.Add(
            1,
            new KeyValuePair<string, object?>("from_status", from.ToString()),
            new KeyValuePair<string, object?>("to_status", to.ToString()),
            new KeyValuePair<string, object?>("actor_role", actorRole));

        if (decisionLatencyHours.HasValue)
        {
            CompensationRequestDecisionLatency.Record(
                decisionLatencyHours.Value,
                new KeyValuePair<string, object?>("to_status", to.ToString()));
        }
    }

    public static void RecordCompensationRequestDeleted(CompensationRequestStatus status, string actorRole)
    {
        CompensationRequestsDeleted.Add(
            1,
            new KeyValuePair<string, object?>("status", status.ToString()),
            new KeyValuePair<string, object?>("actor_role", actorRole));
    }

    public static void RecordCompensationRequestDocumentUploaded(string actorRole, long sizeInBytes)
    {
        CompensationRequestDocumentsUploaded.Add(
            1,
            new KeyValuePair<string, object?>("actor_role", actorRole),
            new KeyValuePair<string, object?>("size_bucket", ToSizeBucket(sizeInBytes)));
    }

    private static string ToSizeBucket(long sizeInBytes)
    {
        return sizeInBytes switch
        {
            < 1024 * 1024 => "lt_1mb",
            < 5 * 1024 * 1024 => "1mb_to_5mb",
            _ => "gte_5mb"
        };
    }
}
