namespace CompensaCoreApi.Services.Documents;

public interface IDocumentStorageService
{
    Task<(string StoredFileName, string FilePath)> SaveDocumentAsync(Stream fileStream, string originalFileName, Guid requestId);
    Task DeleteDocumentAsync(string filePath);
    Task<Stream> GetDocumentStreamAsync(string filePath);
}
