using Microsoft.AspNetCore.Hosting;

namespace CompensaCoreApi.Services.Documents;

public class LocalDocumentStorageService(IWebHostEnvironment environment) : IDocumentStorageService
{
    private readonly string _uploadFolder = Path.Combine(environment.ContentRootPath, "uploads", "documents");

    public async Task<(string StoredFileName, string FilePath)> SaveDocumentAsync(Stream fileStream, string originalFileName, Guid requestId)
    {
        if (!Directory.Exists(_uploadFolder))
        {
            Directory.CreateDirectory(_uploadFolder);
        }

        var extension = Path.GetExtension(originalFileName);
        var storedFileName = $"{Guid.NewGuid()}{extension}";
        var relativePath = Path.Combine("uploads", "documents", storedFileName);
        var fullPath = Path.Combine(environment.ContentRootPath, relativePath);

        using (var outputStream = new FileStream(fullPath, FileMode.Create))
        {
            await fileStream.CopyToAsync(outputStream);
        }

        return (storedFileName, relativePath);
    }

    public Task DeleteDocumentAsync(string filePath)
    {
        var fullPath = Path.Combine(environment.ContentRootPath, filePath);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
        return Task.CompletedTask;
    }

    public Task<Stream> GetDocumentStreamAsync(string filePath)
    {
        var fullPath = Path.Combine(environment.ContentRootPath, filePath);
        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException("Document file not found on disk.", filePath);
        }

        return Task.FromResult<Stream>(new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read));
    }
}
