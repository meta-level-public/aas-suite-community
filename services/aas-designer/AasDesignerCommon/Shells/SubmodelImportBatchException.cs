namespace AasDesignerCommon.Shells;

public class SubmodelImportBatchException : Exception
{
    public SubmodelImportBatchException(IReadOnlyList<SubmodelImportException> failures)
        : base("One or more submodels could not be imported.")
    {
        Failures = failures;
    }

    public IReadOnlyList<SubmodelImportException> Failures { get; }
}
