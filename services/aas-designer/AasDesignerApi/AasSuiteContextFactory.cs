using AasDesignerApi.Model;
using Microsoft.EntityFrameworkCore.Design;

namespace AasDesignerApi;

public sealed class AasSuiteContextFactory : IDesignTimeDbContextFactory<AasSuiteContext>
{
    public AasSuiteContext CreateDbContext(string[] args)
    {
        return new AasSuiteContext(AasSuiteContextOptionsFactory.CreateForCurrentEnvironment());
    }
}
