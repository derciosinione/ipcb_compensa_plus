using System.Text.Json;
using System.Text.Json.Serialization;
using CompensaCoreApi.Contracts;
using CompensaCoreApi.Domain.CompensationRequests;
using CompensaCoreApi.Dtos.CompensationRequests;

namespace CompensaCoreApi.Tests;

[Trait("Category", "Integration")]
public sealed class ApiContractTests
{
    [Fact]
    public void Ok_ReturnsSuccessfulEnvelopeWithData()
    {
        var response = ApiResponse<string>.Ok("Loaded.", "payload");

        Assert.True(response.Success);
        Assert.Equal("Loaded.", response.Message);
        Assert.Equal("payload", response.Data);
        Assert.Null(response.Errors);
    }

    [Fact]
    public void Fail_ReturnsValidationEnvelopeWithErrors()
    {
        var errors = new Dictionary<string, string[]>
        {
            ["newDate"] = ["The new date is required."]
        };

        var response = ApiResponse<object>.Fail("Validation failed.", errors);

        Assert.False(response.Success);
        Assert.Equal("Validation failed.", response.Message);
        Assert.Null(response.Data);
        Assert.Same(errors, response.Errors);
    }

    [Fact]
    public void JsonOptions_SerializeCompensationRequestEnumsAsStrings()
    {
        var request = new UpdateCompensationRequestStatusRequest
        {
            Status = CompensationRequestStatus.Approved,
            DecisionComment = "Approved by coordinator."
        };
        var options = new JsonSerializerOptions();
        options.Converters.Add(new JsonStringEnumConverter());

        var json = JsonSerializer.Serialize(request, options);

        Assert.Contains("\"Status\":\"Approved\"", json);
        Assert.DoesNotContain("\"Status\":1", json);
    }
}
